import { DRACOLoader } from '../lib/DRACOLoader.js';
import { TWEEN } from '../lib/tween.module.min.js';
import { OrbitControls } from '../lib/OrbitControls.js';
import { GLTFHandler } from '../gltfLib/GLTFHandler.js';
import { GLTFMaterializer } from '../gltfLib/GLTFMaterializer.js';
import { GLTFAnimator } from '../gltfLib/GLTFAnimator.js';
import { GLTFAnalyzer } from '../gltfLib/GLTFAnalyzer.js';
import { OutlineEffect } from '../lib/OutlineEffect.js';
import { EffectComposer } from '../lib/EffectComposer.js';
import { GLTFPostProcessor } from '../gltfLib/GLTFPostProcessor.js';
import { GLTFFpsChecker } from '../gltfLib/GLTFFpsChecker.js';

import Stats from '../lib/stats.module.js';

var container;
var sceneURI;
var camera;
var renderer;
var scene;
var clock;
var model;
var ambient, light, light2, hemiLight, hemiLight2;
var $this;
var clickEffectScene;
var animations;
var gltfHandler;
var gltfMaterializer;
var gltfUI;
var gltfAnalyzer;
var gltfPostProcessor;
var gltfAnimator;
var gltfFpsChecker;
var gltfVersionManager;
var screenLoader;
var modal;
var contextDetector;
var perfHelper;
var sceneObjects;
var dataJSON;
var principleControls;
var effectSceneControls;
var outline;
var clickOutline;
var sceneObjects;
var stats;
var composer;
var composerClickEffect;
var screenWidth = 0;
var manager;
var sceneURI;
var glbSceneURIPos = 0;
var refreshDelay = 10000;
var fpsState;


class GLTFViewer{

  constructor(json, gltfVersionManagerToHandle, sceneURIToHandle, gltfUIToHandle, modalToHandle, screenLoaderToHandle, contextDetect){
    $this = this;
    dataJSON = json;
    gltfVersionManager = gltfVersionManagerToHandle;
    sceneURI = sceneURIToHandle;
    contextDetector = contextDetect;
    gltfAnalyzer = new GLTFAnalyzer();
    gltfFpsChecker = new GLTFFpsChecker();
    gltfUI = gltfUIToHandle;
    perfHelper = gltfUI.getPerfHelper();
    if(perfHelper != null){
      perfHelper.setVersionManager(gltfVersionManager)
    }
    screenLoader = screenLoaderToHandle;
    gltfUI.setViewer($this);
    modal = modalToHandle;
    $this.init();
    $this.controller();
  }

  init(){
    if(dataJSON.scene.perfHelper.on){
      $this.checkPerf()
    }
    if(dataJSON.scene.UIHelper.on){
      gltfUI.getUIHelper().hideHelp();
    }
    $this.initScene();
    $this.setGltfScene();
  }

  controller(){
    window.addEventListener("resize",$this.onWindowResize);
  }

  /**
  * Création de l'élément canvas
  */
  initRenderer(){
    return new Promise( resolve => {
      container = document.querySelector('#container');
      clock = new THREE.Clock();

      renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      resolve(container.appendChild(renderer.domElement));
    })
  }


  async initScene(){
    await $this.initRenderer().then(function () {
      scene = new THREE.Scene();
      scene.userData.dataJSON = dataJSON;
      let cameraParams = dataJSON.scene.camera;
      const aspect = container.clientWidth / container.clientHeight;
      camera = new THREE.PerspectiveCamera(cameraParams.fov, aspect, cameraParams.near, cameraParams.far);
      camera.position.set(cameraParams.position.x, cameraParams.position.y, cameraParams.position.z)

      //scene parrallele pour outline jaune
      clickEffectScene = {
          scene: new THREE.Scene(),
          camera: new THREE.PerspectiveCamera(cameraParams.fov, aspect, cameraParams.near, cameraParams.far)
      };
      if(scene.userData.dataJSON.scene.rotation.on){
        scene.rotation.y = scene.userData.dataJSON.scene.rotation.y
        clickEffectScene.scene.rotation.y = scene.userData.dataJSON.scene.rotation.y
      }
      clickEffectScene.camera.position.set(cameraParams.position.x, cameraParams.position.y, cameraParams.position.z)

      if(scene.userData.dataJSON.scene.shadowLight.on){
        let shadowLightParams = scene.userData.dataJSON.scene.shadowLight;
        hemiLight = new THREE.HemisphereLight(0xfff7d9, 0x080820, shadowLightParams.hemiLightIntensity);
        hemiLight.position.set(0,30,0)
        scene.add(hemiLight);

        hemiLight2 = new THREE.HemisphereLight(0xfff7d9, 0x080820, shadowLightParams.hemiLightIntensity);
        hemiLight.position.set(0,30,0)
        clickEffectScene.scene.add(hemiLight2);

        light = new THREE.SpotLight(0xfff398,0.8);
        light.position.set(shadowLightParams.position.x, shadowLightParams.position.y, shadowLightParams.position.z);
        light.angle = 1;
        light.intensity = shadowLightParams.shadowLightIntensity;
        light.castShadow = true;
        light.shadow.bias = -0.0001;
        light.shadow.mapSize.width = 1024*4;
        light.shadow.mapSize.height = 1024*4;
        scene.add( light );

        if(scene.userData.dataJSON.scene.shadowLight.helper){
          let helper = new THREE.SpotLightHelper( light );
          scene.add(helper);
          let shadowCameraHelper = new THREE.CameraHelper( light.shadow.camera );
  				scene.add( shadowCameraHelper );
        }

        light2 = new THREE.SpotLight(0xffa95c,0.8);
        light2.position.set(shadowLightParams.position.x, shadowLightParams.position.y, shadowLightParams.position.z);
        light.angle = 1;
        light.intensity = shadowLightParams.shadowLightIntensity;
        light2.castShadow = true;
        light2.shadow.bias = -0.0001;
        light2.shadow.mapSize.width = 1024*4;
        light2.shadow.mapSize.height = 1024*4;
        clickEffectScene.scene.add(light2);
      }else{
        ambient = new THREE.AmbientLight(0x404040,1);
        let ambient2 = new THREE.AmbientLight(0x404040,1);
        scene.add(ambient);
        clickEffectScene.scene.add(ambient2)

        light = new THREE.DirectionalLight(0xffffff,1);
        light.position.set(10,10,10);
        let light2 = light = new THREE.DirectionalLight(0xffffff,1);
        light2.position.set(10,10,10);
        scene.add(light);
        clickEffectScene.scene.add(light2);
      }

      $this.setOutlines();

      if(scene.userData.dataJSON.scene.postProcessing.on){
        composer = new EffectComposer(renderer);
        gltfPostProcessor = new GLTFPostProcessor(composer);
        composer = gltfPostProcessor.process(renderer, scene, camera, scene.userData)
      }
      $this.setOrbitControls(camera, renderer, clickEffectScene, dataJSON);
      if(screenWidth != window.innerWidth){
        $this.setCameraDepth();
        screenWidth = window.innerWidth
      }
      window.addEventListener("resize",function(){
        //anti reset de la cam quand toolbar firefox mobile apparait
        if(screenWidth != window.innerWidth){
          $this.setCameraDepth();
          screenWidth = window.innerWidth
        }
      });
    });
  }

  setCameraDepth(){
    let width = $("#container").width();
    let height = $("#container").height();
    let cameraParams = dataJSON.scene.camera;
    let z = dataJSON.scene.camera.position.z;
    let y = dataJSON.scene.camera.position.y;
    let fov = dataJSON.scene.camera.fov;
    if(height > 620){}
    if(width > 800){
      z *= 1.8;
      y = dataJSON.scene.camera.position.y;
      fov *= 1.1;
    }
    if(width > 540 && width < 800){
      z *= 2.6;
      y = dataJSON.scene.camera.position.y;
      fov *= 1.4;
    }
    if(width < 540){
      z *= 3.6;
      y = dataJSON.scene.camera.position.y;
      fov *= 1.8;
    }
    camera.position.set(cameraParams.position.x, y, z);
    camera.fov = fov;
    camera.updateProjectionMatrix();
    clickEffectScene.camera.position.set(cameraParams.position.x, y, z);
    clickEffectScene.camera.fov = fov;
    clickEffectScene.camera.updateProjectionMatrix();
  }

  setOutlines(){
    if(scene.userData.dataJSON.scene.outline.on){
      let params = scene.userData.dataJSON.scene.outline
      outline = new OutlineEffect(
        renderer,{defaultThickness:params.thickness,defaultColor:params.color,defaultAlpha:params.alpha});
    }
    let clickOLParams = scene.userData.dataJSON.scene.clickOutline
    clickOutline = new OutlineEffect(renderer,{defaultThickness:clickOLParams.thickness,defaultColor:clickOLParams.color,defaultAlpha:clickOLParams.alpha});
  }

  setOrbitControls(camera, renderer, clickEffectScene, dataJSON){
    let params = dataJSON.scene.controls;
    principleControls = new OrbitControls( camera, renderer.domElement );
    principleControls.target.set(params.target.x, params.target.y, params.target.z);
    principleControls.enablePan = params.enablePan;
    principleControls.panSpeed = params.panSpeed;
    principleControls.enableRotate = params.enableRotate;
    principleControls.rotateSpeed = params.rotateSpeed;
    principleControls.enableZoom = params.enableZoom;
    principleControls.enableDamping = params.enableDamping;
    principleControls.dampingFactor = params.dampingFactor;
    principleControls.minPolarAngle = Math.PI / params.minPolarAngle;
    principleControls.maxPolarAngle = Math.PI / params.maxPolarAngle;
    if(params.minAzimuthAngle != 'none' && params.maxAzimuthAngle != 'none'){
      principleControls.minAzimuthAngle = params.minAzimuthAngle * Math.PI;
      principleControls.maxAzimuthAngle = params.maxAzimuthAngle * Math.PI;
    }
    principleControls.minDistance = params.minDistance;
    principleControls.maxDistance = params.maxDistance;

    effectSceneControls = new OrbitControls( clickEffectScene.camera, renderer.domElement );
    effectSceneControls.target.set(params.target.x, params.target.y, params.target.z);
    effectSceneControls.enablePan = params.enablePan;
    effectSceneControls.panSpeed = params.panSpeed;
    effectSceneControls.enableRotate = params.enableRotate;
    effectSceneControls.rotateSpeed = params.rotateSpeed;
    effectSceneControls.enableZoom = params.enableZoom;
    effectSceneControls.enableDamping = params.enableDamping;
    effectSceneControls.dampingFactor = params.dampingFactor;
    effectSceneControls.minPolarAngle = Math.PI / params.minPolarAngle;
    effectSceneControls.maxPolarAngle = Math.PI / params.maxPolarAngle;
    if(params.minAzimuthAngle != 'none' && params.maxAzimuthAngle != 'none'){
      effectSceneControls.minAzimuthAngle = params.minAzimuthAngle * Math.PI;
      effectSceneControls.maxAzimuthAngle = params.maxAzimuthAngle * Math.PI;
    }
    effectSceneControls.minDistance = params.minDistance;
    effectSceneControls.maxDistance = params.maxDistance;

    principleControls.update();
    effectSceneControls.update();
  }

  setOrbitControlsHeight(weight, controls){
    let oldWeight = controls.target.y;
    if(weight != oldWeight){
      if(weight == 0){
        oldWeight = 1
      }else{
        oldWeight = 0
      }
    }
    let destination = { x: 0, y: weight, z:0 };
    let coords = { x: 0, y: oldWeight, z:0 };
    new TWEEN.Tween(coords)
      .to({ x: destination.x, y: destination.y, z:destination.z },1000)
      .onUpdate(() =>
        controls.target.set(coords.x, coords.y, coords.z)
      )
      .start();
  }

  getPrincipleControls(){
    return principleControls;
  }

  getEffectSceneControls(){
    return effectSceneControls;
  }

  loadGltfScene() {
    return new Promise(function (resolve){
      const dracoLoader = new DRACOLoader();
    	dracoLoader.setDecoderPath( '../index/js/lib' );
      manager = new THREE.LoadingManager();
      $this.setLoadingBar();
    	const loader = new THREE.GLTFLoader(manager);
    	loader.setDRACOLoader( dracoLoader );
      //si defaut de rafraichissement -> changer le nom de la scene
    	loader.load(sceneURI , function ( gltf ) {
        	model = gltf.scene;
          model.traverse(n => {
            if ( n.isMesh ) {
              n.castShadow = true;
              n.receiveShadow = true;
              if(n.material.map)
                n.material.map.anisotropy = 16;
              }
            }
          );
        	scene.add(model);
          $this.setGltfAnimator(dataJSON, model, gltf, gltfUI);
          resolve(scene)
    	});
    })

  }

  setLoadingBar(){
    manager.onProgress = function ( item, loaded, total ) {
      screenLoader.setLoadingBar(Math.round((loaded / total * 100)))
    };
  }

  async setGltfScene(){
    await $this.loadGltfScene().then(function(){
      let interactiveObjects;
      sceneObjects = gltfAnalyzer.getSceneObjects(scene);
      if(scene.userData.dataJSON.scene.interactiveObjects.on){
        interactiveObjects = $this.getInteractiveObjectUUIDsAndNames(sceneObjects);
      }
      scene.userData.dataJSON.scene.objects = gltfAnalyzer.getSceneObjectsUUIDAndName(scene);
      gltfAnalyzer.resetGroupNameUUID()
      gltfMaterializer = new GLTFMaterializer(contextDetector, gltfAnalyzer, sceneObjects);
      gltfMaterializer.materialSetter(scene, sceneObjects, interactiveObjects);
      gltfUI.initUI();
      if(scene.userData.dataJSON.scene.backgroundURI.on){
        //methode 1
        $('body').css('background-image','url('+scene.userData.dataJSON.scene.backgroundURI.uri+')')
        //methode 2
        // const loader = new THREE.TextureLoader();
        // loader.load(scene.userData.dataJSON.scene.backgroundURI.uri , function(texture) {
        //              scene.background = texture;
        //             });
        //methode 3
        // container.style.backgroundImage = "url("+scene.userData.dataJSON.scene.backgroundURI+")";
      }
      if(scene.userData.dataJSON.scene.interactiveObjects.on){
        scene.userData.titleToHideFlag = false;
        gltfHandler = new GLTFHandler($this, gltfMaterializer,
          gltfAnalyzer, gltfAnimator, scene, clickEffectScene,
          contextDetector, gltfUI, modal,
          sceneObjects, interactiveObjects);
        gltfUI.setHandler(gltfHandler);
      }
      if(scene.userData.dataJSON.scene.zoomAnimate.on){
        $this.zoomAnimate();
      }
      if(scene.userData.dataJSON.scene.stats.on){
        stats = Stats()
      }
      if(scene.userData.dataJSON.scene.stats.showPanel){
        document.body.appendChild(stats.dom)
      }
      $this.animate()
    })
  }

  getInteractiveObjectUUIDsAndNames(sceneObjects){
    let interactiveObjects = scene.userData.dataJSON.scene.interactiveObjects.objects;
    for(let interactiveObject in interactiveObjects){
      let objInScene = gltfAnalyzer.findObjectByName(sceneObjects, interactiveObject);
      if(objInScene.type == 'Group'){
        let groupUUID = gltfAnalyzer.getUUIDNameGroup(objInScene);
        interactiveObjects[interactiveObject].objects = groupUUID;
        gltfAnalyzer.resetGroupNameUUID()
      }
      if(objInScene.type == 'Mesh'){
        if(objInScene.children.length > 0){
          let groupUUID = gltfAnalyzer.getUUIDNameGroup(objInScene);
          interactiveObjects[interactiveObject].objects = groupUUID;
          gltfAnalyzer.resetGroupNameUUID()
        }else{
          let objArray = [];
          objArray.push(gltfAnalyzer.setUUIDAndNameJson(objInScene))
          interactiveObjects[interactiveObject].objects = objArray;
        }
      }
    }
    return interactiveObjects;
  }

  setGltfAnimator(dataJSON, model, gltf, gltfUI){
    gltfAnimator = new GLTFAnimator(dataJSON, model, gltf, gltfUI, $this);
    dataJSON.scene.animationPlayer.elementUsers.forEach((element) => {
      if(element == 'Modal'){
        modal.setGLTFAnimator(gltfAnimator)
      }
      if(element == 'AudioPlayer'){
        gltfUI.setGLTFAnimatorForAudioPlayer(gltfAnimator)
      }
    });
  }

  animate(){
    $this.render()
    requestAnimationFrame( $this.animate );
  }

  render(){
  	const delta = clock.getDelta();
    TWEEN.update();
    if(scene.userData.dataJSON.scene.autoRotation.on){
      if(scene.userData.dataJSON.scene.autoRotation.clock){
        scene.rotation.y += scene.userData.dataJSON.scene.autoRotation.speed;
        clickEffectScene.scene.rotation.y += scene.userData.dataJSON.scene.autoRotation.speed;
      }else{
        scene.rotation.y -= scene.userData.dataJSON.scene.autoRotation.speed;
        clickEffectScene.scene.rotation.y -= scene.userData.dataJSON.scene.autoRotation.speed;
      }
    }

    if(scene.userData.dataJSON.scene.shadowLight.move){
      light.position.set(
        camera.position.x + 10,
        camera.position.y + 10,
        camera.position.z + 10,
      )
      light2.position.set(
        camera.position.x + 10,
        camera.position.y + 10,
        camera.position.z + 10,
      )
      renderer.shadowMap.enabled = true;
    }

    principleControls.update();
    effectSceneControls.update();
    clickOutline.render(clickEffectScene.scene, clickEffectScene.camera);
    if(scene.userData.dataJSON.scene.outline.on){
      outline.autoClear = false;
      outline.render(scene, camera);
    }else{
      renderer.render(scene, camera)
    }
    if(scene.userData.dataJSON.scene.postProcessing.on){
      composer.render();
    }
    if(scene.userData.dataJSON.scene.stats.on){
      stats.update();
    }
  }

  zoomAnimate(){
    let width = $("#container").width();
    let z = 7;
    if(width > 540 && width < 960){
      z = 12
    }
    if(width < 540){
      z = 15
    }

    // (x=largeur , z=profondeur , y=hauteur)
    const destination = { x: -2, y: -5, z:z };
    const coords = { x: 0, y: 50, z:600 };
    new TWEEN.Tween(coords)
      .to({ x: destination.x, y: destination.y, z:destination.z },2500)
      .onUpdate(() =>
        camera.position.set(coords.x, coords.y, coords.z)
      )
      .start();

    new TWEEN.Tween(coords)
      .to({ x: destination.x, y: destination.y, z:destination.z },2500)
      .onUpdate(() =>
        clickEffectScene.camera.position.set(coords.x, coords.y, coords.z)
      )
      .start();
  }

  getCameraDirection(){
    var vector = new THREE.Vector3(); // create once and reuse it!
    return camera.getWorldDirection( vector );
  }

  getCamera(){
    return camera;
  }

  getCameraEffectScene(){
    return clickEffectScene.camera;
  }

  roundNumber(number){
    var num = Number(number) ;
    return num.toFixed(1);
  }

  onWindowResize(){
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    clickEffectScene.camera.aspect = container.clientWidth / container.clientHeight;
    clickEffectScene.camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    if(scene.userData.dataJSON.scene.postProcessing.on){
      composer.setSize(container.clientWidth, container.clientHeight);
    }
  }

  getTitleMenuFlag(){
    return scene.userData.titleMenuFlag
  }

  getRenderer(){
    return renderer
  }

  getClickEffectScene(){
    return clickEffectScene.scene
  }

  getScene(){
    return scene
  }

  getCamera(){
    return camera;
  }

  getInteractiveObjects(){
    return $this.getInteractiveObjectUUIDsAndNames(sceneObjects);
  }

  checkPerf(){
    setTimeout(function(){
      fpsState = gltfFpsChecker.getFPSState();
      if(typeof fpsState == 'number' && fpsState != 0){
        if(fpsState < 8){
          perfHelper.showHelp('threeVersion')
          refreshDelay = 3000
        }else{
          refreshDelay = 5000
        }
      }else{
        refreshDelay = 500
      }
      $this.checkPerf();
    },refreshDelay)
  }
}

export { GLTFViewer };
