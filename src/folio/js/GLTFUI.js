import { CookieManager } from '../../../../../build/gltfLib/CookieManager.js';
import { ScrollControls } from '../../../build/gltfLib/ScrollControls.js';
import { AudioPlayer } from '../../../build/gltfLib/AudioPlayer.js';
import { Router } from '../../../build/gltfLib/Router.js';
import { UIHelper } from '../../../build/MVCComponents/ViewComponent/UIHelper/UIHelper.js';
import { PerfHelper } from '../../../build/MVCComponents/ViewComponent/PerfHelper/PerfHelper.js';

var $this;
var uiHelper;
var perfHelper;
var audioPlayer;
var gltfViewer;
var gltfHandler;
var gltfAnimator;
var cookieManager;
var router;
var contextDetector;
var modal;
var objData;
var dataJSON;
var menuIsOpen = false;
var menuDirection;
var domElements =`<div id="title">
          <p id="name">David Liger </p>
          <p id="quality"> Web Developper</p>
          </div>
          <div id="menu">
          <button id="pathBtn" title="Parcours"><img></img><span>Parcours</span></button>
          <button id="projectsBtn" title="Projets"><img></img><span>Technos</span></button>
          <button id="contactBtn" title="Contact"><img></img><span>Contact</span></button>
          </div>
          `
var sidebarOpen = false;

class GLTFUI {

  constructor(contextDetect, modalToHandle, dataJSONToHandle, gltfVersionManager) {
    $this = this;
    dataJSON = dataJSONToHandle;
    contextDetector = contextDetect;
    cookieManager = new CookieManager();
    if(dataJSON.audioPlayer.on){
      audioPlayer = new AudioPlayer(dataJSON);
    }
    if(dataJSON.scene.UIHelper.on){
      uiHelper = new UIHelper($this, contextDetector, dataJSON);
    }
    if(dataJSON.scene.perfHelper.on){
      perfHelper = new PerfHelper(dataJSON, gltfVersionManager, $this);
    }
    router = new Router();
    router.setModal(modalToHandle)
    modal = router.getModal();
    $this.inject();
    $this.controller();
  }

  inject(){
    document.querySelector('#container').insertAdjacentHTML('beforebegin', domElements)
  }

  setViewer(viewer){
    gltfViewer = viewer;
  }

  setHandler(handler){
    gltfHandler = handler;
  }

  controller(){
    //just modal.setModal('path') par exemple
    $(document).on("click","#pathBtn", function(e){
      modal.setModal('path')
    })
    $(document).on("click","#projectsBtn", function(e){
      modal.setModal('projects')
    })
    $(document).on("click","#contactBtn", function(e){
      modal.setModal('contact')
    })
    window.addEventListener("resize",function(){
      $this.setMenuPosForMobile()
    });
    $(window).on('click', function(e){
      if(sidebarOpen){
        let el = $(e.target);
        if(el.attr("id") != 'sidebar_menu' &&
          el.attr("id") != 'menu'){
            $this.hidesideBar()
        }
      }
    })
  }

  setRoute(){
    if(typeof objData.eventListener.mousedown == 'object'){
      objData.eventListener.mousedown.forEach((action) => {
        router.routeTo(action)
      });
    }else{
      router.routeTo(action)
    }
  }

  initUI(){
    setTimeout(function(){
      if(dataJSON.scene.UIHelper.on){
        uiHelper.showHelp()
      }
      $this.showTitle();
      $this.showMenu();
      // audioPlayer.showRadio();
    }, 2500)
    if(dataJSON.scene.UIHelper.on &&
      dataJSON.scene.UIHelper.autoOpen &&
      !cookieManager.readCookie('UIHelper').hideUIHelper){
      setTimeout(function(){
        uiHelper.openCloseHelp()
      }, 2500)
      setTimeout(function(){
          uiHelper.closeHelp()
      }, 9500)
    }
    if(contextDetector.mobileDetector() == 'mobile'){
      $this.setMenuPosForMobile()
    }
  }

  setMenuPosForMobile(){
    if($("#container").height() > 500){
      $("#sidebar_menu").css("top","150px")
      $("#onglet").css("top","150px")
    }else{
      $("#sidebar_menu").css("top","70px")
      $("#onglet").css("top","70px")
    }
  }

  getRouter(){
    return router
  }

  getUIHelper(){
    return uiHelper;
  }

  getPerfHelper(){
    return perfHelper;
  }

  openCloseMenu(){
    let width = $("#container").width();
    let height = $("#container").height();
    if(width > 1080 && height > 500){
      if(menuIsOpen == false){
        menuIsOpen = true;
        menuDirection = 'top';
      }else{
        $this.closeMenu();
      }
    }else{
      if(menuIsOpen == false){
          if(height < 500){
              menuIsOpen = true;
              menuDirection = 'mobileOrientation';
          }else{
            menuIsOpen = true;
            menuDirection = 'left';
          }

      }else{
        $this.closeMenu();
      }
    }
  }

  closeMenu(){
    if(menuIsOpen == true){
      if(menuDirection == 'top'){
      }
      if(menuDirection == 'left'){
      }
      if(menuDirection == 'mobileOrientation'){
      }
      menuIsOpen = false;
    }
  }

  showTitle(){
    $("#title").css("visibility","visible").fadeIn(150);
  }

  hideTitle(){
    $("#title").css("visibility","visible").fadeOut(120);
  }

  showMenu(){
    // $("#onglet").show();
    $("#sidebar_menu").css("visibility","visible").fadeIn(150);
  }

  hideMenu(){
    $("#sidebar_menu").css("visibility","visible").fadeOut(120);
  }

  showOrHideTitle(tooClose){
    let width = $("#container").width();
    let uiHelperIsOpen = false;
    let perfHelperIsOpen = false;
    if(dataJSON.scene.UIHelper.on){
      uiHelperIsOpen = uiHelper.getIsOpen()
    }
    if(dataJSON.scene.perfHelper.on){
      perfHelperIsOpen = perfHelper.getIsOpen()
    }
    // anti tooClose = undefined
    if(tooClose == 'undefined' || tooClose == '' || tooClose == null){
      tooClose = gltfViewer.getTitleMenuFlag()
    }
    // let audioIsOpen = audioPlayer.isOpened();
    // let modalOpen = modal.getModalOpen();
    if(uiHelperIsOpen || perfHelperIsOpen || tooClose
      // || audioIsOpen
      // || modalOpen
    ){
      if(!tooClose){
        if(width < 1400){
          $this.hideTitle()
        }
      }else{
        $this.hideTitle()
      }
    }else{
      $this.showTitle()
    }
  }

  showOrHideMenu(tooClose){
    if(tooClose == 'undefined' || tooClose == '' || tooClose == null){
      tooClose = gltfViewer.getTitleMenuFlag()
    }
    let modalOpen = modal.getModalOpen();
    if(modalOpen || tooClose){
      $this.hideMenu()
    }else{
      $this.showMenu()
    }
  }

  showsideBar(){
    $('.threebar').removeClass('hamburger').addClass('arrow');
    $("#sidebar_menu").animate({width: '+=200px'}, 400);
    $("#sidebar_menu").animate({height: '+=200px'},
      400,
      function(){
      $("#menu").css("visibility","visible").fadeIn(600)
      $("#menu p").css("visibility","visible").fadeIn(800)
    });
    $("#onglet").hide();
    $("#sidebar_menu").css("visibility","visible");
    sidebarOpen = true;
  }

  hidesideBar(){
    $('.threebar').removeClass('arrow').addClass('hamburger');
    $("#sidebar_menu").animate({height: '-=200px'}, 50);
    $("#sidebar_menu").animate({width: '-=200px'}, 300);
    $("#sidebar_menu").css("visibility","hidden");
    $("#menu").css("visibility","visible").fadeOut(40);
    $("#menu p").css("visibility","visible").fadeOut(40);
    $("#onglet").show();
    sidebarOpen = false;
  }

  growOrShrinkIcon(on, icon){
    if(on){
      $('#'+icon+'Btn').css('transform','scale(2.2)')
    }else{
      $('#'+icon+'Btn').css('transform','scale(2)')
    }
  }

  roundNumber(number){
    var num = Number(number) ;
    return num.toFixed(1);
  }

}

export {GLTFUI}
