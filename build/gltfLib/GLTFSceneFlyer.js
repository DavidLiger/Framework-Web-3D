var scene;
var gltfHandler;
var gltfViewer;
var gltfUI;
var sceneObjects;
var $this;
var oldPos = {'x':0};
var pos = {'x':0};
var visibleFlag = false;
var distanceToObj;
var camera;
var visibleLockedObjs;
var gltfAnalyzer;
var objectToFocus;
var allInteractiveObjs;
var limit;
var outLimitFlag = true;
var title3DObjects = [];
var distanceToObjectToFocus;

class GLTFSceneFlyer {
  constructor(gltfView, sceneToHandle, sceneObjectsToHandle, gltfAnalyz, gltfUIToHandle, gltfHandl) {
    $this = this;
    scene = sceneToHandle;
    sceneObjects = sceneObjectsToHandle;
    gltfHandler = gltfHandl;
    gltfAnalyzer = gltfAnalyz;
    gltfViewer = gltfView;
    gltfUI = gltfUIToHandle;
    if(scene.userData.dataJSON.scene.flyThrough.visibleLockedObjs.on){
      visibleLockedObjs = scene.userData.dataJSON.scene.flyThrough.visibleLockedObjs.objects;
    }
    camera = gltfViewer.getCamera();
    limit = $this.setLimitToShowTitle(scene.userData.dataJSON.scene.sceneContainer);
    window.addEventListener("resize",function(){
      limit = $this.setLimitToShowTitle(scene.userData.dataJSON.scene.sceneContainer);
    });
    objectToFocus = gltfAnalyzer.findObjectByName(sceneObjects, scene.userData.dataJSON.scene.flyThrough.objectToFocus);
    allInteractiveObjs = gltfHandler.getAllInteractiveObjs();
    $this.animate();
  }

  setHiddenOncollision(){
    let limit = 1.5;
    sceneObjects.forEach((sceneObject)=> {
      distanceToObj = camera.position.distanceTo(sceneObject.position);
      if(distanceToObj < limit){
        if(!visibleLockedObjs.includes(sceneObject.name)){
          sceneObject.visible = false;
        }else{
          sceneObject.visible = true;
        }
      }else{
        sceneObject.visible = true;
      }
    });
    allInteractiveObjs.forEach((sceneObject)=> {
      distanceToObj = camera.position.distanceTo(sceneObject.position);
      if(distanceToObj < limit){
        if(!visibleLockedObjs.includes(sceneObject.name)){
          sceneObject.visible = false;
        }else{
          sceneObject.visible = true;
        }
      }else{
        sceneObject.visible = true;
      }
    });
  }

  setLimitToShowTitle(container){
    let width = $(""+container+"").width();
    let adptativeLimit;
    let baseLimit = scene.userData.dataJSON.scene.flyThrough.limit;
    if(width > 960){
      adptativeLimit = baseLimit
    }
    if(width > 540 && width < 960){
      adptativeLimit = baseLimit*1.02
    }
    if(width < 540){
      adptativeLimit = baseLimit*1.01
    }
    return adptativeLimit;
  }

  showHideTitleAndMenu(){
    distanceToObjectToFocus = camera.position.distanceTo(objectToFocus.position);
    if(distanceToObjectToFocus < limit){
      outLimitFlag = false;
    }else{
      outLimitFlag = true;
    }
    if(!outLimitFlag){
      scene.userData.titleMenuFlag = true;
      gltfUI.showOrHideTitle(true)
      gltfUI.showOrHideMenu(true)
      $this.showInteractiveObjectsTitles(true)
    }else{
      scene.userData.titleMenuFlag = false
      gltfUI.showOrHideTitle(false)
      gltfUI.showOrHideMenu(false)
      $this.showInteractiveObjectsTitles(false)
    }
  }

  showInteractiveObjectsTitles(show){
    scene.userData.dataJSON.scene.objects.forEach((obj)=> {
      let specMatType;
      specMatType = obj.name.split('_');
      for(let specMat in specMatType){
        if (specMatType[specMat] == 'title3D') {
          let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
          object.visible = show;
          title3DObjects.push(object);
        }
        if (specMatType[specMat] == 'title') {
          let object = gltfAnalyzer.findObjectByUUID(sceneObjects, obj.uuid)
          title3DObjects.push(object);
        }
      }
    });
  }

  getCamera(){
    scene.getCamera();
  }

  //act on cam moving
  getCamMoves(){
    pos.x = $this.roundNumber(camera.position.x);
    if(pos.x != oldPos.x){
      visibleFlag = true;
      oldPos.x = pos.x;
    }else{
      visibleFlag = false;
    }
  }

  getOutLimitFlag(){
    return outLimitFlag;
  }

  getDistanceToObjectToFocus(){
    return distanceToObjectToFocus
  }

  roundNumber(number){
    var num = Number(number) ;
    return num.toFixed(1);
  }

  animate(){
    $this.render();
    requestAnimationFrame( $this.animate );
  }

  render(){
    if(camera != null){
      $this.getCamMoves();
    }
    if(visibleFlag){
      if(scene.userData.dataJSON.scene.flyThrough.visibleLockedObjs.on){
        $this.setHiddenOncollision();
      }
    }
    setTimeout(function(){
        $this.showHideTitleAndMenu();
    }, 2500)
    if(title3DObjects.length > 0){
      title3DObjects.forEach((obj) => {
        obj.rotation.z = - Math.atan2( ( camera.position.x - obj.position.x ), ( camera.position.z + obj.position.z ) );
      });

    }
  }
}

export {GLTFSceneFlyer}
