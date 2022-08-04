import { Reflector } from '../lib/Reflector.js';
import { GLTFVideoTexture } from '../gltfLib/GLTFVideoTexture.js';

var $this;
var contextDetector;
var gltfVideoTexture;
var gltfAnalyzer;
var scene;
var sceneObjects;

class GLTFMaterializer {

  constructor(contextDetect, gltfAnalyz, sceneObjectsToHandle) {
    $this = this;
    gltfAnalyzer = gltfAnalyz;
    contextDetector = contextDetect;
    sceneObjects = sceneObjectsToHandle;
  }

  materialSetter(sceneToHandle, sceneObjects, interactiveObjects){
    scene = sceneToHandle;
    let specMat;
    if(gltfAnalyzer.includeKeyInProps('videoDisplayer', interactiveObjects)){
      gltfVideoTexture = new GLTFVideoTexture($this, gltfAnalyzer, interactiveObjects, scene, contextDetector, sceneObjects)
    }
    scene.userData.dataJSON.scene.objects.forEach((obj)=> {
      $this.setMaterial(obj, sceneObjects);
    });
  }

  setMaterial(obj, sceneObjects){
    let specMatType;
    if(obj.name.includes('alphaImg')){
      obj.name = obj.name.slice(0,obj.name.indexOf('alphaImg')+8)+'_'+obj.name.slice(obj.name.indexOf('alphaImg')+8,obj.name.length-1);
    }
    //anti-disparition -> TOUJOURS garder 'Armature' dans le nom d'une armature
    if(obj.name.includes('Armature')){
      obj.name = obj.name.slice(0,obj.name.indexOf('Armature')+8)+'_'+obj.name.slice(obj.name.indexOf('Armature')+8,obj.name.length-1);
    }
    specMatType = obj.name.split('_');
    for(let specMat in specMatType){
      if (specMatType[specMat] == 'glass') {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
        $this.setGlassMaterial(object);
      }
      if (specMatType[specMat] == 'mirror') {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
        $this.createMirror(object);
      }
      if (specMatType[specMat] == 'emit') {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
        let color = specMatType[specMat-1];
        $this.setEmitMaterial(object, color);
      }
      if (specMatType[specMat] == 'wireframe') {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
        let color = specMatType[specMat-1];
        $this.setWireMaterial(object, color);
      }
      // text-to-mesh dans blender
      if (specMatType[specMat] == 'title') {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
        object.visible = false;
        // $this.setEmitMaterial(object, '0xffffff');
      }
      if (specMatType[specMat] == 'title3D') {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
        object.visible = false;
      }
      if (specMatType[specMat] == 'alphaImg') {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
        let img = specMatType[specMat-1];
        $this.setAlphaImageTexture(object, img);
      }
      if (specMatType[specMat] == 'Armature') {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid);
        let group = gltfAnalyzer.getUUIDNameGroup(object)
        group.forEach((obj) => {
          let objToSet = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid);
          objToSet.frustumCulled = false;
        });
      }
    }
  }

  createMirror(obj){
    obj.visible = false;
    let scaleX = $this.roundNumber(obj.scale.x)*1.7;
    let scaleY = $this.roundNumber(obj.scale.y)*2;
    let scaleZ = 0.002;
    let geometry = new THREE.BoxGeometry(scaleX, scaleY, scaleZ);
    let mirror = new Reflector( geometry, {
      clipBias: 0.3,
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
      color: 0x889999,
      side: THREE.BackSide
    } );
    mirror.rotation.x = obj.rotation.x;
    mirror.rotation.y = obj.rotation.y;
    mirror.rotation.z = obj.rotation.z;

    mirror.position.x = obj.position.x;
    mirror.position.y = obj.position.y;
    mirror.position.z = obj.position.z-0.03;
    scene.add( mirror );
  }

  setGlassMaterial(mesh){
    let glass = new THREE.MeshPhysicalMaterial({
        color: 'white',
        metalness: .9,
        roughness: .05,
        envMapIntensity: 0.9,
        clearcoat: 1,
        transparent: true,
        opacity: .3,
        reflectivity: 0.6,
        refractionRatio: 0.985,
        ior: 0.9,
        side: THREE.DoubleSide
    })
    mesh.material = glass;
  }

  setEmitMaterial(mesh, color){
    // hexa : ex = 0x30cce0
    let hexa = color.substring(0,2);
    if(hexa == '0x'){
      color = parseInt(color)
    }
    let hexaColor = new THREE.Color( color );
    let emitMat = new THREE.MeshPhongMaterial({
        color: hexaColor,
        emissive: hexaColor
    })
    mesh.material = emitMat;
  }

  setWireMaterial(mesh, color){
    let hexa = color.substring(0,2);
    if(hexa == '0x'){
      color = parseInt(color)
    }
    let hexaColor = new THREE.Color( color );
    let wireMat = new THREE.MeshLambertMaterial({
        color: hexaColor,
        emissive: hexaColor,
        wireframe: true
    })
    mesh.material = wireMat;
  }

  setImageTexture(mesh, img){
    let loader = new THREE.TextureLoader();
    let material = new THREE.MeshBasicMaterial({
      map: loader.load(img)
    });
    material.side = THREE.DoubleSide;
    mesh.material = material;
  }

  setAlphaImageTexture(mesh, img){
    let texture = new THREE.TextureLoader().load('../../src/studio/assets/images/'+img+'.png');
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.y = - 1;
    let material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      // depthTest: false
    });
    mesh.material = material;
  }

  roundNumber(number){
    var num = Number(number) ;
    return num.toFixed(1);
  }

  getGltfVdtx(){
    return gltfVideoTexture;
  }
}

export {GLTFMaterializer}
