import { CookieManager } from '../gltfLib/CookieManager.js';

var cookieManager;
var contextDetector;
var dataJSON;
var cookies = {
  'sceneURI':''
};
var sceneURI;
var url;
var $this;

class GLTFVersionManager {
  constructor(json, contextDetectorToHandle) {
    $this = this;
    dataJSON = json;
    cookieManager = new CookieManager();
    contextDetector = contextDetectorToHandle;
    $this.init()
  }

  init(){
    $this.initGLTFURIInCookies();
  }

  initGLTFURIInCookies(){
    url = window.location.href;
    let glbSceneVersion = cookieManager.readCookie(url);
    if(glbSceneVersion === null){
      if(contextDetector.isWebGLCompatible()){
        cookies.sceneURI = dataJSON.scene.sceneURI.threeVersion
      }else{
        cookies.sceneURI = dataJSON.scene.sceneURI.img
      }
      cookieManager.bakeCookie(url,cookies);
      $this.initGLTFURIInCookies()
    }else{
      sceneURI = cookieManager.readCookie(url).sceneURI;
    }
  }

  setGLTFURIINCookies(type){
    if(type == 'img'){
      cookies.sceneURI = dataJSON.scene.sceneURI.img
    }else{
      cookies.sceneURI = dataJSON.scene.sceneURI.threeVersion
    }
    cookieManager.bakeCookie(url,cookies);
  }

  getDataJSON(){
    return dataJSON
  }

  getGlbSceneURIPos(){
    return dataJSON.scene.sceneURI.indexOf(sceneURI)
  }

  getSceneURI(){
    return sceneURI
  }
}

export {GLTFVersionManager}
