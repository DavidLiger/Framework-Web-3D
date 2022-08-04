import { Router } from '../gltfLib/Router.js';
import { GLTFFpsChecker } from '../gltfLib/GLTFFpsChecker.js';

var $this;
var model;
var gltfUI;
var gltfViewer;
var gltfVdtx;
var gltfFpsChecker;
var router;
var autoMixer;
var mixer;
var clock;
var dataJSON;
var animations;
var action;
var animationToPlay;
var animGroupToPlay = [];
var animPlayedHistory = [];
var finishedFlagVideo = false;
var finishedFlag = false;
var video;
var modal;
var afterActionOrder;
var timeDelay;

class GLTFAnimator {
  constructor(dataJSONToHandle, modelToHandle, gltf, gltfUIToHandle, gltfViewerToHandle) {
    $this = this;
    model = modelToHandle;
    gltfUI = gltfUIToHandle;
    gltfViewer = gltfViewerToHandle;
    router = gltfUI.getRouter();
    gltfFpsChecker = new GLTFFpsChecker();
    dataJSON = dataJSONToHandle;
    animations = gltf.animations;
    animations.sort();
    mixer = new THREE.AnimationMixer(model);
    autoMixer = new THREE.AnimationMixer(model);
    clock = new THREE.Clock();
    $this.autoAnimate();
    $this.animate()
  }

  autoAnimate(){
    if(!dataJSON.scene.animationPlayer.on){
      let interactiveAnims = [];
      let animationsNames = [];
      let animsDifference;
      dataJSON.scene.animationPlayer.animations.forEach((anim) => {
        interactiveAnims.push(anim.track)
      });
      animations.forEach((anim) => {
        animationsNames.push(anim.name)
      });
      animsDifference = animationsNames.filter(x => !interactiveAnims.includes(x));
      animsDifference.forEach((animDiff) => {
        animations.forEach((anim) => {
          if(anim.name == animDiff){
            autoMixer.clipAction(anim).play();
          }
        });
      });
    }
  }

  playAnimation(anims, actionAfter, gltfVdtx, modalAfter, timeToWait){
    animGroupToPlay.push(anims);
    anims.forEach((anim) => {
      let playerParams = dataJSON.scene.animationPlayer.animations;
      let animationParams;
      for(let params in playerParams){
        if(playerParams[params].name == anim){
          animationParams = playerParams[params];
        }
      }
      for(let animation in animations){
        if(animations[animation].name == animationParams.track){
          if(animationParams.hasOwnProperty('animationToStop')){
            $this.autoStopUnwantedAnim(animationParams.animationToStop)
          }
          animPlayedHistory.push(animations[animation].name);
          let animationToPlay = mixer.clipAction(animations[animation]);
          $this.setAnimation(animationToPlay, animationParams.code, actionAfter, gltfVdtx, modalAfter, timeToWait);
        }
      }
    });
  }

  setAnimation(animationToPlay, code, actionAfter, gltfVdtxToHandle, modalAfter, timeToWait){
    let orders = code.split('_');
    orders.forEach((order) => {
      animationToPlay.paused = false;
      //Normal
      if(order == 'N'){
        animationToPlay.timeScale = 1;
      }
      //Reverse
      if(order == 'R'){
        animationToPlay.timeScale = -1;
      }
      //Once
      if(order == 'O'){
        animationToPlay.setLoop(THREE.LoopOnce);
        animationToPlay.clampWhenFinished = true;
        animationToPlay.enable = true;
        animationToPlay.play()
      }
      //Once then Modal
      if(order == 'OTM'){
        afterActionOrder = 'OTM'
        modal = actionAfter;
        animationToPlay.setLoop(THREE.LoopOnce);
        animationToPlay.clampWhenFinished = true;
        animationToPlay.enable = true;
        animationToPlay.play()
        //si plusieurs anim attention aux temps
        //(rallongé les plus courtes !!)
        mixer.addEventListener('finished',function(){
          if(!finishedFlag){
            finishedFlag = true
          }
        });
      }
      //Once then Video
      if(order == 'OTV'){
        afterActionOrder = 'OTV';
        if(gltfVdtxToHandle != null){
          gltfVdtx = gltfVdtxToHandle
          video = actionAfter
        }
        animationToPlay.setLoop(THREE.LoopOnce);
        animationToPlay.clampWhenFinished = true;
        animationToPlay.enable = true;
        animationToPlay.play();
        //flag permet de recuperer 1 SEUL event 'finished'
        mixer.addEventListener('finished', function(){
          if(!finishedFlag){
            finishedFlag = true
          }
        })
      }
      //Once then Video then Modal
      if(order == 'OTVTM'){
        afterActionOrder = 'OTVTM';
        modal = modalAfter;
        timeDelay = timeToWait;
        if(gltfVdtxToHandle != null){
          gltfVdtx = gltfVdtxToHandle
          video = actionAfter
        }
        animationToPlay.setLoop(THREE.LoopOnce);
        animationToPlay.clampWhenFinished = true;
        animationToPlay.enable = true;
        animationToPlay.play();
        //flag permet de recuperer 1 SEUL event 'finished'
        mixer.addEventListener('finished', function(){
          if(!finishedFlag){
            finishedFlag = true
          }
        })
      }
      //Loop
      if(order == 'L'){
        animationToPlay.setLoop(THREE.LoopPingPong);
        animationToPlay.play()
      }
      //AutoReset
      if(order == 'AR'){
        animationToPlay.time = 0;
      }
    });
  }

  videoZapperAfterAnim(){
    if(video != null){
      gltfVdtx.videoTextureZapper(video)
    }
  }

  openModalAfterAnim(){
    router.routeTo(modal)
  }

  openModalAfterVideoZapperAfterAnim(){
    if(video != null){
      gltfVdtx.videoTextureZapper(video)
    }
    //A gerer selon les fps
    let fpsSate = gltfFpsChecker.getFPSState();
    let fpsPerf = (fpsSate/0.6)/100;
    timeDelay = Math.round(timeDelay*fpsPerf);
    if(typeof timeDelay == 'number' && timeDelay > 800){
      setTimeout(function(){
        $this.openModalAfterAnim()
      },timeDelay)
    }else{
      $this.openModalAfterAnim()
    }
  }

  autoStopUnwantedAnim(animationToStop){
    if(typeof animationToStop == 'object'){
      animationToStop.forEach((anim) => {
        for(let animation in animations){
          if(animations[animation].name == anim){
            let animationToStop = mixer.clipAction(animations[animation]);
            animationToStop.stop()
          }
        }
      });
    }else{
      for(let animation in animations){
        if(animations[animation].name == animationToStop){
          let animationToStop = mixer.clipAction(animations[animation]);
          animationToStop.stop()
        }
      }
    }
  }

  getAnimPlayedHistory(){
    return animPlayedHistory
  }

  getIsAnimFinished(){
    return isAnimFinished
  }

  setIsAnimFinished(value){
    isAnimFinished = value
  }

  resetAnimPlayedHistory(){
    animPlayedHistory = []
  }

  resetAfterActionOrder(){
    afterActionOrder = ''
  }

  getGltfVdtx(){
    if(gltfVdtx != null){
      return gltfVdtx
    }
  }

  getInteractiveObjects(){
    return gltfViewer.getInteractiveObjects()
  }

  animate(){
    $this.render()
    requestAnimationFrame( $this.animate );
  }

  render(){
    const delta = clock.getDelta();
    mixer.update( delta )
    autoMixer.update(delta)
    if(finishedFlag){
      if(afterActionOrder == 'OTM'){
        $this.openModalAfterAnim()
        finishedFlag = false;
      }
      if(afterActionOrder == 'OTV'){
        $this.videoZapperAfterAnim()
        finishedFlag = false;
      }
      if(afterActionOrder == 'OTVTM'){
        $this.openModalAfterVideoZapperAfterAnim()
        finishedFlag = false;
        afterActionOrder = '';
      }else{
        finishedFlag = false;
      }
    }
  }
}

export {GLTFAnimator}
