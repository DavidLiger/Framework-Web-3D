import { TextureAnimator } from '../gltfLib/TextureAnimator.js';
import { GLTFFpsChecker } from '../gltfLib/GLTFFpsChecker.js';

// GIF a definir avec res max : 520x281 et nb images max : 48 /!\ img width size max = 16384 px /!\
var $this;
var browser;
var clock;
var interactiveObjects;
var scene;
var gltfMaterializer;
var gltfAnalyzer;
var gltfFpsChecker;
var annies = [];
var sceneObjects;
var actualQuality = 'LD';
var fpsState;
var qualityToSet = 'LD';;
var refreshDelay = 5000;


class GLTFVideoTexture {

  constructor(gltfMaterializerToHandle, gltfAnalyz, interactiveObjectsToHandle, sceneToHandle, contextDetector, sceneObjectsToHandle) {
    $this = this;
    gltfMaterializer = gltfMaterializerToHandle;
    gltfAnalyzer = gltfAnalyz;
    gltfFpsChecker = new GLTFFpsChecker();
    browser = contextDetector.getBrowser()+'_'+contextDetector.mobileDetector();
    clock = new THREE.Clock();
    interactiveObjects = interactiveObjectsToHandle;
    scene = sceneToHandle;
    sceneObjects = sceneObjectsToHandle;
    $this.setTexture(interactiveObjects, actualQuality);
    $this.manageMediaQuality();
    $this.animate();
  }

  manageMediaQuality(){
    setTimeout(function(){
      fpsState = gltfFpsChecker.getFPSState();
      if(typeof fpsState == 'number'){
        if(fpsState > 40){
          qualityToSet = 'HD';
        }
        if(fpsState > 25 && fpsState < 40){
          qualityToSet = 'MD';
          refreshDelay /= 2
        }
        if(fpsState > 10 && fpsState < 25){
          qualityToSet = 'LD';
          refreshDelay /= 10
        }
        if(fpsState < 10){
          qualityToSet = 'VLD';
          refreshDelay = 10
        }
        if(actualQuality != qualityToSet){
          $this.resetTexture(interactiveObjects, qualityToSet, true);
          actualQuality = qualityToSet;
        }
        $this.manageMediaQuality();
      }
    },refreshDelay)
  }

  getObjectToTexture(interactiveObject){
    let screenID = interactiveObject.videoDisplayer.source.code;
    let screenObject;
    interactiveObject.objects.forEach((interactiveObj) => {
      let codes = interactiveObj.name.split('_');
      codes.forEach((key) => {
        if(key === screenID){
          screenObject = gltfAnalyzer.findObjectByUUID(sceneObjects, interactiveObj.uuid);
        }
      });
    });
    return screenObject;
  }

  setTexture(interactiveObjects, qualityDef, currentTime){
    for(let obj in interactiveObjects){
      $this.setMedia(interactiveObjects[obj], qualityDef, currentTime);
    }
  }

  resetTexture(interactiveObjects, qualityDef, currentTime){
    for(let obj in interactiveObjects){
      if(!interactiveObjects[obj].eventListener.mousemove.includes('outline')){
        $this.setMedia(interactiveObjects[obj], qualityDef, currentTime);
      }
    }
  }

  setMedia(obj, qualityDef, currentTime){
    let video;
    let curTime;
    if(obj.hasOwnProperty('videoDisplayer')){
      if(currentTime){
        curTime = document.querySelector('#'+obj.videoDisplayer.source.htmlContentId+'').currentTime;
      }
      if(browser == 'Firefox_mobile'){
        $this.setAnimatedImageTexture(
          $this.getObjectToTexture(obj),
          obj.videoDisplayer.animatedImages[obj.videoDisplayer.track].track,
          obj.videoDisplayer.animatedImages[obj.videoDisplayer.track].nbImg,
          obj.videoDisplayer.source.flipX);
      }else{
        if(qualityDef != 'VLD'){
          if(qualityDef == 'HD'){
            video = obj.videoDisplayer.HD[obj.videoDisplayer.track]
          }
          if(qualityDef == 'MD'){
            video = obj.videoDisplayer.MD[obj.videoDisplayer.track]
          }
          if(qualityDef == 'LD'){
            video = obj.videoDisplayer.LD[obj.videoDisplayer.track]
          }
          $this.setVideoTexture(
            $this.getObjectToTexture(obj),
            video,
            obj.videoDisplayer.source.htmlContentId,
            obj.videoDisplayer.source.flipX,
            curTime
          );
          video = ""
        }else{
          //si nom contient Animated
          $this.setAnimatedImageTexture(
            $this.getObjectToTexture(obj),
            obj.videoDisplayer.animatedImages[obj.videoDisplayer.track].track,
            obj.videoDisplayer.animatedImages[obj.videoDisplayer.track].nbImg,
            obj.videoDisplayer.source.flipX);
        }
      }
    }
  }

  setVideoTexture(mesh, videoSrc, htmlElement, flipX, currentTime){
    let video = document.querySelector('#'+htmlElement+'');
    //si extension fichier == mp4
    let fileName = videoSrc.split('/');
    let fileExt = fileName[fileName.length-1].split('.');
    fileExt = fileExt[fileExt.length-1];
    if(fileExt != 'mp4'){
      gltfMaterializer.setImageTexture(mesh, videoSrc)
    }else{
      video.src = videoSrc;
      let videoTexture = new THREE.VideoTexture(video);
      videoTexture.generateMipmaps = false;
      videoTexture.wrapS = videoTexture.wrapT = THREE.ClampToEdgeWrapping;
      videoTexture.minFilter = THREE.LinearFilter;
      if(flipX){
        let reverseScaleX = -Math.abs(mesh.scale.x)
        mesh.scale.x = reverseScaleX;
      }
      let videoMat = new THREE.MeshBasicMaterial({map : videoTexture});
      videoMat.side = THREE.DoubleSide;
      mesh.material = videoMat;
      video.loop = true;
      video.muted = true;
      if(currentTime != null){
        video.currentTime = currentTime;
        video.play().catch((e)=>{
        })
      }
    }
  }

  setAnimatedImageTexture(mesh, img, nbImg, flipX){
    let fileName = img.split('/');
    fileName = fileName[fileName.length-1];
    if(!fileName.includes('Animated')){
      gltfMaterializer.setImageTexture(mesh, img)
    }else{
      let runnerTexture = new THREE.ImageUtils.loadTexture(img);
      let annie = new TextureAnimator( runnerTexture, nbImg, 1, nbImg, 75 );
      annies.push(annie)
      var animatedMaterial = new THREE.MeshBasicMaterial( {
        map: runnerTexture
      } );
      if(flipX){
        let reverseScaleX = -Math.abs(mesh.scale.x)
        mesh.scale.x = reverseScaleX;
      }
      animatedMaterial.side = THREE.DoubleSide;
      mesh.material = animatedMaterial;
    }
  }

  videoTextureZapper(dataObj){
    let screens = [];
    let length = dataObj.videoDisplayer.HD.length;
    if(dataObj.videoDisplayer.track < length-1){
      dataObj.videoDisplayer.track++
    }else{
      dataObj.videoDisplayer.track = 0
    }
    $this.setMedia(dataObj, actualQuality);
  }

  animate(){
    $this.render()
    requestAnimationFrame( $this.animate );
  }

  render(){
  	const delta = clock.getDelta();
    annies.forEach((annie) => {
      if(annie != null){
        annie.update(1000 * delta);
      }
    });
  }
}

export {GLTFVideoTexture}
