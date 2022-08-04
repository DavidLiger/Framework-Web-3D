import {ModalHelper} from '../ModalHelper/ModalHelper.js';
import { CookieManager } from '../../../../../build/gltfLib/CookieManager.js';

var data;
var dataJSON;
var cursor = 0;
var imgCursor = 0;
var actualCursorPos = 5;
var btnClick = false;
var btnClickIsRunningFlag = false;
var instructionParagraph = {
  'technos':{
    'pc':'Cliquez sur une techno pour voir les projets l\'utilisant',
    'mobile':'Touchez une techno pour voir les projets l\'utilisant'
  },
  'projets':{
    'pc':'Cliquez sur un projet pour + d\infos',
    'mobile':'Touchez un projet pour + d\infos'
  }
};
var btnImgUrls = {
  'closeCross': '../../../../../build/assets/images/cross_circle.png',
  'infoBtn': '../../../../build/MVCComponents/ViewComponent/JsonFilterList/images/info-circle.png'
};
var technoIcons = {};
var type = '';
var techno = '';
var contextDetector;
var cookieManager;
var modal;
var btnsUI;
var $this;

class JsonFilterList {

  constructor(containerId, contextDetectorToHandle, dataToHandle, dataJSONToHandle, modalToHandle){
    contextDetector = contextDetectorToHandle;
    cookieManager = new CookieManager();
    modal = modalToHandle;
    data = dataToHandle;
    dataJSON = dataJSONToHandle;
    $this = this;
    if(dataJSON.modalHelper.on){
      new ModalHelper(contextDetector, dataJSON, 'projects');
    }
    $this.setHtmlWithData(containerId);
    // $this.injectCSS();
    $this.controller();
  }

  injectCSS(){
    let jsonFilterListCSS = document.getElementById('jsonFilterListCSS')
    if(!jsonFilterListCSS){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','jsonFilterListCSS');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/JsonFilterList/JsonFilterList.css');
      document.head.appendChild(cssLink);
    }
  }

  controller(){
    window.addEventListener('resize', function(event) {}, true);
    $(document).on('click','.technoBtn',function(){
      type = $(this).attr('data-type')
      techno = $(this).attr('data-value')
      $this.setResults(500)
    })
    $(document).on('click','.previewContainer',function(){
      btnClick = true;
      if(btnClick && !btnClickIsRunningFlag){
        modal.setModal('projectDisplayer', $(this).attr('data-name'))
        btnClickIsRunningFlag = true;
      }
      setTimeout(function(){
        btnClick = false;
        btnClickIsRunningFlag = false
      },1000)
    })
    $(document).on('click','#techSearchBtn',function(){
      type = ''
      techno = ''
      $this.showTechnos()
    })
  }

  setHtmlWithData(containerId){
    imgCursor = 0;
    actualCursorPos = 5;
    $(''+containerId+'').html($this.getHtmlContent());
    $('#technos').html($this.setTechnoBtns())
    $this.setInstructions('technos');
    $this.setTitle('technos')
    if(type != '' && techno != ''){
      $('#previews').text('Un instant ...')
      $this.setResults(50)
    }
  }

  async setTechno(){
    await $this.setTechnoBtns().then(function(){
      $('#technos').html(btnsUI)
    })
  }

  setTechnoBtns(){
    let btnsUI = '';
    Object.entries(data.buttons).forEach(([key, value], i) => {
      let tempBtns = '';
      Object.entries(value).forEach(([valKey, valValue]) => {
        tempBtns += `
        <button class='technoBtn' data-type="${key}" data-value="${valKey}">
          <div class='technoBtnNoteNIconContainer'>
            <div class='technoBtnNote'><img src="${$this.setStarsByNote(valValue.note)}"></div>
            <div class='technoBtnIcon'><img src="${valValue.imgUrl}"></div>
          </div>
          <div class='technoBtnName'>${valKey}</div>
        </button>`;
      })
      btnsUI += `<div class='technoBtnContainer'><div class='btnsContainerTitle'>${key}</div><div class='btnsContainerList'><div class='btnsContainer' id='${'btnsContainer'+i}'>${tempBtns}</div></div></div>`
    })
    return btnsUI
  }

  setStarsByNote(note){
    let starsImgs = [
      '../build/MVCComponents/ViewComponent/JsonFilterList/images/deux-etoiles-small.png',
      '../build/MVCComponents/ViewComponent/JsonFilterList/images/trois-etoiles-small.png',
      '../build/MVCComponents/ViewComponent/JsonFilterList/images/quatre-etoiles-small.png'
    ];
    return starsImgs[note-2]
  }

  setPreviewText(text){
    let textString = '';
    let wordCount = 0;
    let previewText = '';
    text.forEach((item) => {
      textString += item;
    });
    textString = textString.replace(/<\/span>/g,'');
    textString = textString.replace(/<span>/g,'');
    textString = textString.replace(/<img>/g,'');
    let normalText = textString.split(' ');
    normalText.forEach((text) => {
      if(wordCount < 20){
        previewText += text+' '
        wordCount++
      }
    });
    previewText += '...'
    return previewText
  }

  loadPreviews(type, techno){
    let previews = [];
    data.projectsData.forEach((preview) => {
      Object.entries(preview).forEach(([key, value]) => {
        if(key == type){
          if(!Array.isArray(value)){
            if(value == techno){
              previews.push(preview)
            }
          }else{
            value.forEach((val) => {
              if(val == techno){
                previews.push(preview)
              }
            });
          }
        }
      })
    })
    return $this.createPreview(previews)
  }

  createPreview(previews){
    let previewsUI = '';
    previews.forEach((preview) => {
      let tempPreview = '';
      let technos = '';
      if(preview.hasOwnProperty('language')){
        if(Array.isArray(preview.language)){
          preview.language.forEach((lang) => {
            technos += $this.setTechnoSpan('language',lang)
          });
        }else{
          technos += $this.setTechnoSpan('language',preview.language)
        }
      }
      if(preview.hasOwnProperty('framework')){
        if(Array.isArray(preview.framework)){
          preview.framework.forEach((framework) => {
            technos += $this.setTechnoSpan('framework',framework)
          });
        }else{
          technos += $this.setTechnoSpan('framework',preview.framework)
        }
      }
      if(preview.hasOwnProperty('library')){
        if(Array.isArray(preview.library)){
          preview.library.forEach((library) => {
            technos += $this.setTechnoSpan('library',library)
          });
        }else{
          technos += $this.setTechnoSpan('library',preview.library)
        }
      }
      if(preview.hasOwnProperty('database')){
        if(Array.isArray(preview.database)){
          preview.database.forEach((database) => {
            technos += $this.setTechnoSpan('database',database)
          });
        }else{
          technos += $this.setTechnoSpan('database',preview.database)
        }
      }
      if(preview.hasOwnProperty('tools')){
        if(Array.isArray(preview.tools)){
          preview.tools.forEach((tools) => {
            technos += $this.setTechnoSpan('tools',tools)
          });
        }else{
          technos += $this.setTechnoSpan('tools',preview.tools)
        }
      }
      //pour texte limitée à certains nombre de mots
      //quand text complet
      previewsUI += `
      <div class='previewContainer' data-name='${preview.title}'>
        <div class='previewHead'>
          <div class='previewType'>${$this.setIconForPreview(preview.type)}</div>
          <div class='previewTitle'>${preview.title}</div>
        </div>
        <div class='previewContent'>
          <div class='previewImgContainer'><img class='previewImg' src="${preview.img[0].url}"></img></div>
          <div class='previewText'>${$this.setPreviewText(preview.text)}</div>
        </div>
        <div class='technoSpanList'>${technos}</div>
      </div>`;
    })
    return previewsUI
  }

  setIconForPreview(type){
    let icon;
    if(type == 'jeu'){
      icon = '<img class="iconPreview" src="../../../../build/MVCComponents/ViewComponent/JsonFilterList/images/icon-game.png">'
    }
    if(type == 'web'){
      icon = '<img class="iconPreview" src="../../../../build/MVCComponents/ViewComponent/JsonFilterList/images/icon-web.png">'
    }
    if(type == 'mobile'){
      icon = '<img class="iconPreview" src="../../../../build/MVCComponents/ViewComponent/JsonFilterList/images/icon-mobile.png">'
    }
    return icon
  }

  setTechnoSpan(type, techno){
    return `
      <div class='technoSpan'>
        <img src="${$this.setPreviewTechnoSpanIcon(type,techno)}">
        <span>${techno}</span>
      </div>`
  }

  setPreviewTechnoSpanIcon(type,techno){
    let buttons = data.buttons;
    let imgUrl;
    Object.entries(buttons).forEach(([key, value]) => {
      if(key == type){
        Object.entries(value).forEach(([valKey, valValue]) => {
          if(valKey == techno){
            imgUrl = valValue.imgUrl;
          }
        });
      }
    });
    return imgUrl
  }

  showResults(speed){
    $('#technos').hide('slide', {direction: 'left'}, speed);
    $('#results').show('slide', {direction: 'right'}, speed);
    $('#previews').scrollTop(0)
    $('.technoSpanList').scrollLeft(0)
    $this.setInstructions('projets')
    $this.setTitle('projets')

  }

  showTechnos(){
    $('#results').hide('slide', {direction: 'right'}, 500);
    $('#technos').show('slide', {direction: 'left'}, 500);
    $('.btnsContainerList').scrollLeft(0)
    $this.setInstructions('technos')
    $this.setTitle('technos')
  }

  setTitle(display){
    if(display == 'technos'){
      $('#articleTitle').html('technos')
    }else{
      $('#articleTitle').html('projets')
    }
  }

  setInstructions(display){
    if(display == 'technos'){
      if(contextDetector.mobileDetector() == 'mobile'){
        $('#instructions').text(instructionParagraph.technos.mobile)
      }else{
        $('#instructions').text(instructionParagraph.technos.pc)
      }
    }else{
      if(contextDetector.mobileDetector() == 'mobile'){
        $('#instructions').text(instructionParagraph.projets.mobile)
      }else{
        $('#instructions').text(instructionParagraph.projets.pc)
      }
    }
  }

  setResults(speed){
    $('#previews').empty().html($this.loadPreviews(type, techno))
    $this.showResults(speed)
  }

  getHtmlContent(){
    return `
        <div id="searchContainer">
          <div id='technos'></div>
          <div id='results' hidden>
            <div id='previews'></div>
            <div id='techSearchBtnContainer'>
              <button id='techSearchBtn'>
                <img></img>
                <span>Technos</span>
              </button>
            </div>
          </div>
        </div>
    `
  }

  updateHtml(){}
}

export { JsonFilterList }
