
import { GLTFVersionManager } from '../../../build/gltfLib/GLTFVersionManager.js';
import { GLTFViewer } from '../../../build/gltfLib/GLTFViewer.js';
import { ContextDetector } from '../../../build/lib/ContextDetector.js';
import { PerfHelper } from '../../../build/MVCComponents/ViewComponent/PerfHelper/PerfHelper.js';
import { GLTFUI } from './GLTFUI.js';
import { Modal } from './Modal.js';
import { ScreenLoader } from './ScreenLoader.js';

var dataJSONURI = '../../../src/folio/assets/glb/package.json';
var gltfVersionManager;
var gltfUI;
var gltfViewer;
var perfHelper;
var modal;
var screenLoader;
var sceneURI;

$(document).ready(function () {
  init()
});

function init(){
  let contextDetector = new ContextDetector();
  $.getJSON(dataJSONURI, function(dataJSON){
    gltfVersionManager = new GLTFVersionManager(dataJSON, contextDetector);
    sceneURI = gltfVersionManager.getSceneURI();
    if(isGLB(sceneURI)){
      screenLoader = new ScreenLoader();
      modal = new Modal(contextDetector, dataJSON);
      gltfUI = new GLTFUI(contextDetector, modal, dataJSON, gltfVersionManager);
      gltfViewer = new GLTFViewer(dataJSON, gltfVersionManager, sceneURI, gltfUI, modal, screenLoader, contextDetector);
    }else{
        perfHelper = new PerfHelper(dataJSON, gltfVersionManager)
        if(contextDetector.isWebGLCompatible()){
          perfHelper.showHelp('img')
          //   //UI.js
          //   //Modal.js
        }else{
          perfHelper.showHelp('setWebGL')
          //   //UI.js
          //   //Modal.js
        }
    }
  })
}

function isGLB(sceneURI){
  let sceneURIExtension = sceneURI.split('/');
  sceneURIExtension = sceneURIExtension[sceneURIExtension.length-1].split('.');
  sceneURIExtension = sceneURIExtension[sceneURIExtension.length-1];
  if(sceneURIExtension == 'glb'){
    return true
  }else{
    return false
  }
}

function getSceneURIExtension(){
  return sceneURIExtension
}
