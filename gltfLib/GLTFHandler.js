import { TWEEN } from '../lib/tween.module.min.js';
import { GLTFSceneFlyer } from '../gltfLib/GLTFSceneFlyer.js';

var gltfMaterializer;
var gltfViewer;
var gltfUI;
var gltfAnimator;
var gltfVdtx;
var router;
var modal;
var raycaster;
var browser;
var isMobile;
var modalOpen = false;
var $this;
var scene;
var clickEffectScene;
var gltfAnalyzer;
var gltfSceneFlyer;
var interactiveDataObjects;
var sceneObjects;
var objIntersects = [];
var allInteractiveObjs;

class GLTFHandler {

  constructor(gltfView, gltfMaterial, gltfAnalyz, gltfAnimat, sceneToHandle, clickEffectSceneToHandle, contextDetector, gltfUIToHandle, modalToHandle, sceneObjectsToHandle, interactiveDataObjectsToHandle) {
    gltfViewer = gltfView;
    gltfMaterializer = gltfMaterial;
    gltfAnalyzer = gltfAnalyz;
    gltfAnimator = gltfAnimat;
    gltfUI = gltfUIToHandle;
    router = gltfUI.getRouter();
    modal = router.getModal();
    scene = sceneToHandle;
    clickEffectScene = clickEffectSceneToHandle;
    $this = this;
    sceneObjects = sceneObjectsToHandle;
    interactiveDataObjects = interactiveDataObjectsToHandle;
    if(gltfAnalyzer.includeKeyInProps('videoDisplayer', interactiveDataObjects)){
      gltfVdtx = gltfMaterializer.getGltfVdtx()
    }
    browser = contextDetector.getBrowser()+'_'+contextDetector.mobileDetector();
    isMobile = contextDetector.mobileDetector();
    $this.listenOnEventOnInteractiveObjects();
    if(scene.userData.dataJSON.scene.flyThrough.on){
      gltfSceneFlyer = new GLTFSceneFlyer(gltfViewer, scene, sceneObjects, gltfAnalyzer, gltfUI, $this);
    }
  }

  initRaycaster(renderer, camera){
    // find intersections
    raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    var rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ( ( event.clientX - rect.left ) / ( rect.width - rect.left ) ) * 2 - 1;
    mouse.y = - ( ( event.clientY - rect.top ) / ( rect.bottom - rect.top) ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
  }

  setInteractiveObjects(){
    let objs = [];
    for(let obj in interactiveDataObjects){
      interactiveDataObjects[obj].objects.forEach((objData) => {
        let object = gltfAnalyzer.findObjectByUUID(sceneObjects, objData.uuid)
        objs.push(object)
      });
    }
    return objs
  }

  getParentObject(objects, objData){
    let realObj;
    let parent = gltfAnalyzer.findParent(objects, objData.uuid)
    if(parent == null){
      realObj = gltfAnalyzer.findObjectByUUID(objects, objData.uuid)
    }else{
      realObj = parent;
    }
    return realObj
  }

  listenOnEventOnInteractiveObjects(){
    let realObj;
    allInteractiveObjs = $this.setInteractiveObjects();
    document.addEventListener( 'mousemove', function( event ) {
      if(isMobile != 'mobile' && !modal.getModalOpen()){
        $this.initRaycaster(gltfViewer.getRenderer(), gltfViewer.getCamera());
        objIntersects = raycaster.intersectObjects(allInteractiveObjs);
        for(let obj in interactiveDataObjects){
          interactiveDataObjects[obj].objects.forEach((objData) => {
            if(objIntersects.length > 0){
              if(objData.uuid == objIntersects[0].object.uuid){
                realObj = gltfAnalyzer.findObjectByName(allInteractiveObjs, obj);
                $this.applyOnEvent(true, realObj, interactiveDataObjects[realObj.name].eventListener.mousemove, interactiveDataObjects[obj])
              }
            }else{
              if(realObj){
                $this.applyOnEvent(false, realObj, interactiveDataObjects[realObj.name].eventListener.mousemove, interactiveDataObjects[obj]);
                $this.hideEveryObjectTitle();
                realObj = ''
              }
            }
          });
        }
      }
     }, false );
    document.addEventListener( 'mousedown', function( e ) {
      e.stopPropagation()
      $this.initRaycaster(gltfViewer.getRenderer(), gltfViewer.getCamera());
      objIntersects = raycaster.intersectObjects(allInteractiveObjs);
      for(let obj in interactiveDataObjects){
        interactiveDataObjects[obj].objects.forEach((objData) => {
          if(objIntersects.length > 0){
            if(objData.uuid == objIntersects[0].object.uuid){
              realObj = gltfAnalyzer.findObjectByName(allInteractiveObjs, obj);
              $this.applyOnEvent(true, realObj, interactiveDataObjects[realObj.name].eventListener.mousedown, interactiveDataObjects[obj]);
              $this.hideEveryObjectTitle()
            }
          }
        });
      }
    }, false );
   }

   eventFromUIMouseOver(obj, on){
     let realObj = gltfAnalyzer.findObjectByName(allInteractiveObjs, obj);
     $this.applyOnEvent(on, realObj, interactiveDataObjects[realObj.name].eventListener.mousemove, interactiveDataObjects[obj]);
   }

   eventFromUIMouseDown(obj, on){
     let realObj = gltfAnalyzer.findObjectByName(allInteractiveObjs, obj);
     $this.applyOnEvent(on, realObj, interactiveDataObjects[realObj.name].eventListener.mousedown, interactiveDataObjects[obj]);
   }

   getInteractiveObjDataFromName(name){
     return interactiveDataObjects[name]
   }

   applyOnEvent(on, realObj, actions, dataObj){
     if(typeof actions == 'object'){
       actions.forEach((action) => {
         $this.actions(on, action, realObj, dataObj)
       });
     }else{
       $this.actions(on, action, realObj, dataObj)
     }
   }

   /**
   * OUTLINE ET VIDEOZAPPER INCOMPATIBLES DANS PACKAGE.JSON
   * OUTLINE ET POSTPROCESS INCOMPATIBLES DANS PACKAGE.JSON
   */
   actions(on, action, realObj, dataObj){
     let modalOpen = modal.getModalOpen()
     let sceneAdd, sceneRemove;
     if(on){
       sceneAdd = clickEffectScene.scene;
       sceneRemove = scene;
     }else{
       sceneAdd = scene;
       sceneRemove = clickEffectScene.scene;
     }
     if(action == 'outline'){
       $this.toggleSceneLocation(sceneAdd, sceneRemove, realObj)
     }
     if(action == 'pointerCursor'){
       $this.cursorPointerOnInteractiveObjects(on, realObj);
     }
     if(typeof action == 'object'){
       Object.entries(action).forEach(([key, value]) => {
         if(!modalOpen){
           if(key == 'growIcon'){
             gltfUI.growOrShrinkIcon(on, value)
           }
           if(key == 'showTitle'){
             $this.showOrNotObjectTitle(on, value)
           }
           if(key == 'modal' || key == 'url'){
             let playAnimThenModal = false;
             let actions = interactiveDataObjects[realObj.name].eventListener.mousedown;
             actions.forEach((act) => {
               for (const [key, value] of Object.entries(act)) {
                 if(`${key}` == 'playAnimThenModal'){
                   playAnimThenModal = true
                 }
               }
             })
             if(!playAnimThenModal){
               if(realObj.visible){
                 router.routeTo(action)
               }
             }
           }
           if(key == 'playAnim'){
             gltfAnimator.playAnimation(value)
           }
           //valeur de la modal == derniere val du tab des anims
           if(key == 'playAnimThenModal'){
             let actionAfter;
             let notFinished = true;
             let actions = interactiveDataObjects[realObj.name].eventListener.mousedown;
             actions.forEach((act) => {
               for (const [key, value] of Object.entries(act)) {
                 if(`${key}` == 'modal'){
                   actionAfter = act
                 }
               }
             })
             gltfAnimator.playAnimation(value, actionAfter);
           }
           if(key == 'playAnimThenVideo'){
             let actionAfter;
             let notFinished = true;
             let actions = interactiveDataObjects[realObj.name].eventListener.mousedown;
             actions.forEach((act) => {
               for (const [key, value] of Object.entries(act)) {
                 if(`${key}` == 'videoZapper'){
                   actionAfter = dataObj
                 }
               }
             })
             gltfAnimator.playAnimation(value, actionAfter, gltfVdtx);
           }
           if(key == 'playAnimThenVideoThenModal'){
             let videoAfter;
             let modalAfter;
             let timeToWait;
             let notFinished = true;
             let actions = interactiveDataObjects[realObj.name].eventListener.mousedown;
             actions.forEach((act) => {
               for (const [key, value] of Object.entries(act)) {
                 if(`${key}` == 'videoZapper'){
                   videoAfter = dataObj
                 }
                 if(`${key}` == 'modalAfter'){
                   modalAfter = value[0];
                   for (const [valKey, valValue] of Object.entries(value[1])){
                     timeToWait = valValue
                   }
                 }
               }
             })
             gltfAnimator.playAnimation(value, videoAfter, gltfVdtx, modalAfter, timeToWait);
           }
           if(key == 'videoZapper' && !dataObj.eventListener.mousemove.includes('outline')){
             let playAnimThenVideo = false;
             let actions = interactiveDataObjects[realObj.name].eventListener.mousedown;
             actions.forEach((act) => {
               for (const [key, value] of Object.entries(act)) {
                 if(`${key}` == 'playAnimThenVideo' || `${key}` == 'playAnimThenVideoThenModal'){
                   playAnimThenVideo = true
                 }
               }
             })
             if(!playAnimThenVideo){
               gltfVdtx.videoTextureZapper(dataObj)
             }
           }
           if(key == 'remotePlayAnimThenVideo'){
             $this.eventFromUIMouseDown(value, on)
           }
         }
       });
     }
   }

   showOrNotObjectTitle(on, value){
     let object = gltfAnalyzer.findObjectByName(sceneObjects, value)
     if(scene.userData.dataJSON.scene.flyThrough.on){
       if(!gltfSceneFlyer.getOutLimitFlag()){
         if(on){
           $this.hideEveryObjectTitle()
           object.visible = true
         }else{
           object.visible = false
         }
       }else{
         object.visible = false
       }
     }else{
       if(on){
         $this.hideEveryObjectTitle()
         object.visible = true
       }else{
         object.visible = false
       }
     }
   }

   hideEveryObjectTitle(){
     for(let obj in interactiveDataObjects){
       for(let eventListener in interactiveDataObjects[obj].eventListener.mousemove){
         if(typeof interactiveDataObjects[obj].eventListener.mousemove[eventListener] == 'object'){
           Object.entries(interactiveDataObjects[obj].eventListener.mousemove[eventListener]).forEach(([key, value]) => {
             if(key == 'showTitle'){
               $this.showOrNotObjectTitle(false, value)
             }
           });
         }
       }
     }
   }

   cursorPointerOnInteractiveObjects(on, realObj){
     if(on && realObj.visible){
       $('html,body').css('cursor', 'pointer');
     }else{
       $('html,body').css('cursor', 'default');
     }
   }

  toggleSceneLocation(sceneAdd, sceneRemove, obj){
    if(sceneAdd == clickEffectScene.scene){
      //verifie s'il reste un element dans clickEffecScene et le vire
      sceneAdd.children.forEach((child) => {
        if(child.name != ""){
          sceneRemove.add(child);
          sceneAdd.remove(child);
        }
      });
      sceneAdd.add(obj);
      sceneRemove.remove(obj);
    }else{
      sceneAdd.add(obj);
      sceneRemove.remove(obj);
    }
  }

  getAllInteractiveObjs(){
    return allInteractiveObjs
  }

  getInteractiveDataObjects(){
    return interactiveDataObjects
  }

  getDistanceToObjectToFocus(){
    return gltfSceneFlyer.getDistanceToObjectToFocus()
  }
}

export {GLTFHandler}
