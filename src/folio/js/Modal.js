import {ContactForm} from '../../../build/MVCComponents/ViewComponent/ContactForm/ContactForm.js';
import {TimeStepper} from '../../../build/MVCComponents/ViewComponent/TimeStepper/TimeStepper.js';
import {JsonFilterList} from '../../../build/MVCComponents/ViewComponent/JsonFilterList/JsonFilterList.js';
import {ProjectDisplayer} from '../../../build/MVCComponents/ViewComponent/ProjectDisplayer/ProjectDisplayer.js';

var $this;
var contextDetector;
var cvController;
var contactForm;
var pcInnerHtml = '<span>PC</span>';
var modalOpen = false;
var audioPlayer;
var gltfAnimator;
var gltfVdtx;
var anims;
var timeStepper = null;
var jsonFilterList = null;
const dataJSONURI = '../../../src/folio/assets/data/data.json';
var contacForm = '';
var components;
var mobileOrientation = 0;
var domElements =
  `<div id="modal" hidden>
    <div id='modalHelperContainer'></div>
    <button id="closeModal"><img></img></button>
    <div id="modalContainer">
    </div>
  </div>
  <div id="opacScreen"></div>`;
const templates = {
  "path":`<div id="article">
                  <div id="articleTitle"></div>
                  <div id="articleComponent1"></div>
                  </div>
                  </div>`,
  "projects":`<div id="article">
                  <div id="articleTitle"></div>
                  <div id="articleComponent2"></div>
                  </div>`,
  "projectDisplayer":`<div id="article">
                  <div id="articleTitle"></div>
                  <div id="articleComponent3"></div>
                  </div>`,
  "contact":`<div id="article">
                  <div id="articleHead">
                    <div id="articleTitle"></div>
                    <img id="articleImg" class="contactImg"></img>
                  </div>
                  <a id="articleTel"></a>
                  <div id="articleComponent0"></div>
                  </div>`,
  "msgSentNotif":`<div id="article">
                    <div id="articleTitle"></div>
                    <div id="articleResponse"></div>
                  </div>`
                };
var lastType;
var data;

class Modal{
  constructor(contextDetectorToHandle, dataJSON){
    $this = this;
    contextDetector = contextDetectorToHandle;
    $this.init();
    $this.controller();
    $.getJSON(dataJSONURI, function(dataJSON){
      data = dataJSON;
    })
  }

  init(){
    $this.inject('#container', domElements, 'beforebegin');
  }

  inject(target, elements, position){
    document.querySelector(target).insertAdjacentHTML(position, elements)
  }

  setAudioPlayer(audioPlay){
    audioPlayer = audioPlay
  }

  setGLTFAnimator(gltfAnimat){
    gltfAnimator = gltfAnimat;
  }

  controller(){
    $(document).on("click","#closeModal", function(){
      $this.hideModal();
      modalOpen = false;
    })
    $(document).on("click","#opacScreen", function(e){
      e.stopPropagation();
      $this.hideModal();
      modalOpen = false;
    })
    // portrait || landscape
    // !important! ajout de <script id="jQueryScriptMobile" src="//code.jquery.com/mobile/1.5.0-alpha.1/jquery.mobile-1.5.0-alpha.1.min.js"></script>
    // dans <head> sous <script> jQuery
    $(window).on("orientationchange", function(event){
      $this.setSizeAccordingToMobileOrientation(event.orientation)
    });
  }

  //très fort !!
  setModal(type, projectName){
    if(type != 'projectDisplayer'){
      lastType = type
    }
    let modalData;
    document.getElementById("modalContainer").innerHTML = "";
    $this.inject('#modalContainer', templates[type], 'beforeend')
    Object.entries(data).forEach(([key, value]) => {
      if(key == type){
        Object.entries(value).forEach(([valKey, valValue]) => {
          if(valKey.includes('Img')){
            $("#"+valKey+"").attr('src',valValue)
          }
          if(valKey.includes('Tel')){
            if(contextDetector.mobileDetector() == 'mobile'){
              let telToCall = valValue.split('.');
              telToCall[0] = telToCall[0].slice(1)
              telToCall = `tel:+33${telToCall.join('')}`;
              $("#"+valKey+"").text(valValue)
              $("#"+valKey+"").attr('href',telToCall)
            }else{
              $("#"+valKey+"").html(valValue)
            }
          }
          if(valKey.includes('Component')){
            $('#modalHelperContainer').empty()
            if(valValue.name === 'contactForm'){
              new ContactForm(`#${valKey}`, $this);
            }
            if(valValue.name === 'timeStepper'){
              new TimeStepper(`#${valKey}`, contextDetector, valValue.data, data, $this);
            }
            if(valValue.name === 'jsonFilterList'){
              new JsonFilterList(`#${valKey}`, contextDetector, data.projectData, data, $this);
            }
            if(valValue.name === 'projectDisplayer'){
              new ProjectDisplayer(`#${valKey}`, contextDetector, data.projectData, $this, lastType, projectName);
            }
          }else{
            if(valValue != '' && valValue != 'undefined' && valValue != null){
              $("#"+valKey+"").html(valValue)
            }
          }
        });
      }
    });

    //modele pour liste des projets
    if(type == 'demos'){
      $this.inject('#modalContainer', modalElements, 'beforeend')
      $("#articleTitle").html(`${data.demos.title}`)
      let container = document.getElementById('articleContainer');
      let articles = data.demos.articles;
      articles.forEach((article, i) => {
        container.insertAdjacentHTML('beforeend', previewElements);
        $("#previewContainer").attr('id','previewContainer'+i)
        $("#previewTitle").attr('id','previewTitle'+i)
        $("#previewImg").attr('id','previewImg'+i)
        $("#previewText").attr('id','previewText'+i)
        $("#previewUrl").attr('id','previewUrl'+i)
        Object.entries(article).forEach(([key, value]) => {
          if(key == 'title'){
            $("#previewTitle"+i+"").html(value)
          }
          if(key == 'img'){
            $("#previewImg"+i+"").html('<a href='+article.url+'><img src='+value+'></a>')
          }
          if(key == 'text'){
            $("#previewText"+i+"").prepend(value)
          }
          if(key == 'url'){
            $("#previewUrl"+i+"").attr('href',article.url)
          }
        });
      });
    }
    $this.showModal(type)
  }

  setSizeAccordingToMobileOrientation(eventOrientation){
    if(contextDetector.mobileDetector() == 'mobile'){
      if(modalOpen){
        if(eventOrientation == 'portrait'){
          $('#modal').css({'height':'90vh', 'bottom':'1vh'});
          $('body').css({'overflow':'hidden', 'position':'fixed'});
        }else{
          $('#modal').css({'height':'80vh', 'bottom':'1vh'});
          $('body').css({'overflow':'hidden', 'position':'fixed'});
        }
      }
    }
  }

  showModal(type){
    $("#modal").css("visibility","visible").fadeIn(120);
    $("#opacScreen").css("visibility","visible")
    $('html,body').css('cursor', 'default');
    //anti-decalage de la modal par la toolbar sur mobile
    if(contextDetector.mobileDetector() == 'mobile'){
      if(window.innerHeight > 400){
        //fuck Microsoft
        if(contextDetector.getBrowser() == 'EdgA'){
          $('#modal').css({'height':'85vh', 'bottom':'1vh'});
          $('#modalContainer').css({'height':'100%', 'bottom':'1vh'});
          $('#formContainer').css({'height':'45vh'});
          $('#cursor').css({'height':'15%'});
        }else{
          $('#modal').css({'height':'90vh', 'bottom':'1vh'});
        }
      }else{
        $('#modal').css({'height':'80vh', 'bottom':'1vh'});
      }
      $('body').css({'overflow':'hidden', 'position':'fixed'});
    }
    let article = document.getElementById('article');
    if(article != null){
      article.scrollTop = 0
    }
    modalOpen = true;
  }

  hideModal(){
    $("#modal").css("visibility","hidden").fadeOut(120);
    $("#opacScreen").css("visibility","hidden");
    //anti-decalage de la modal par la toolbar sur mobile
    if(contextDetector.mobileDetector() == 'mobile'){
      $('#modal').css({'height':'96vh', 'bottom':'2vh'});
      $('body').css({'overflow':'', 'position':''});
    }
    modalOpen = false;
  }

  setModalOpen(val){
    modalOpen = val;
  }

  getModalOpen(){
    return modalOpen;
  }

  getGltfAnimator(){
    return gltfAnimator;
  }
}

export { Modal };
