import {Carousel} from '../Carousel/Carousel.js'
import {VideoPlayer} from '../VideoPlayer/VideoPlayer.js'
import {PdfReader} from '../PdfReader/PdfReader.js'
import {ImageViewer} from '../ImageViewer/ImageViewer.js'

var data;
var cursor = 0;
var imgCursor = 0;
var actualCursorPos = 5;
var btnClick = false;
var btnIsRunningFlag = false;
var carousel;
var contextDetector;
var modal;
var projectName;
var callingModal;
var $this;

class ProjectDisplayer {

  constructor(containerId, contextDetectorToHandle, dataToHandle, modalToHandle, callingModalTypeToHandle, projectNameToHandle){
    contextDetector = contextDetectorToHandle;
    data = dataToHandle;
    modal = modalToHandle;
    callingModal = callingModalTypeToHandle;
    projectName = projectNameToHandle;
    $this = this;
    $this.setData();
    $this.setHtmlWithData(containerId);
    // $this.injectCSS();
    $this.controller();
  }

  setData(){
    data.projectsData.forEach((item) => {
      if(item.title == projectName){
        data = '';
        data = item;
      }
    });
  }

  injectCSS(){
    let projectDisplayerCSS = document.getElementById('projectDisplayerCSS')
    if(!projectDisplayerCSS){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','projectDisplayerCSS');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/ProjectDisplayer/ProjectDisplayer.css');
      document.head.appendChild(cssLink);
    }
  }

  controller(){
    $(document).on('click','.resourceBtn',function(){
      btnClick = true;
      if(btnClick && !btnIsRunningFlag){
        btnIsRunningFlag = true;
        let type = $(this).attr('data-type')
        let url = $(this).attr('data-url')
        $this.setResourceDisplayer(type, url)
      }
      setTimeout(function(){
        btnClick = false;
        btnIsRunningFlag = false
      },500)
    })
    $(document).on('click','#backBtn',function(){
      btnClick = true;
      if(btnClick && !btnIsRunningFlag){
        btnIsRunningFlag = true;
        modal.setModal(callingModal)
      }
      setTimeout(function(){
        btnClick = false;
        btnIsRunningFlag = false
      },500)
    })
    //articleImg
    $(document).on('click','.articleImg',function(){
      btnClick = true;
      if(btnClick && !btnIsRunningFlag){
        btnIsRunningFlag = true;
        let type = $(this).attr('data-type')
        let name = $(this).attr('data-name')
        $this.setResourceDisplayer(type, name)
      }
      setTimeout(function(){
        btnClick = false;
        btnIsRunningFlag = false
      },500)
    })
  }

  setHtmlWithData(containerId){
    imgCursor = 0;
    actualCursorPos = 5;
    $('#articleTitle').text(data.title)
    $(''+containerId+'').html($this.getHtmlContent());
  }

  setResourceBtns(elements){
    let resourceBtns = '';
    let imgUrl;
    elements.forEach((element) => {
      if(element.type == 'video'){
        imgUrl = '../../../../build/MVCComponents/ViewComponent/ProjectDisplayer/images/youtube-icon.png'
      }
      if(element.type == 'pdf'){
        imgUrl = '../../../../build/MVCComponents/ViewComponent/ProjectDisplayer/images/pdf-icon.png'
      }
      if(element.type == 'web'){
        if(element.name == 'Code Source'){
          imgUrl = '../../../../build/MVCComponents/ViewComponent/ProjectDisplayer/images/github-icon.png'
        }else{
          imgUrl = '../../../../build/MVCComponents/ViewComponent/ProjectDisplayer/images/web-icon.png'
        }

      }
      resourceBtns += `<button class="resourceBtn" data-type="${element.type}" data-url="${element.url}"><img src="${imgUrl}"><span>${element.name}</span></button>`
    });
    return resourceBtns
  }

  setText(text){
    let textString = '';
    let imgsCount = 0;
    text.forEach((item) => {
      if(item == '<img>'){
        item = `<img class="articleImg" src="${data.img[imgsCount].url}" data-type="img" data-name="${data.img[imgsCount].name}">`
        imgsCount++
      }
      textString += item
    });
    return textString
  }

  setBackBtnTitle(callingModal){
    let btnTitle;
    if(callingModal == 'projects'){
      btnTitle = 'Projets'
    }
    if(callingModal == 'path'){
      btnTitle = 'Parcours'
    }
    return btnTitle
  }

  getHtmlContent(){
    console.log(data);
    return `
        <div id='projectDisplayerContent'>
          <div id='projectDisplayerProjects'>${$this.setResourceBtns(data.resources)}</div>
          <div id='projectDisplayerText'>${$this.setText(data.text)}</div>
        </div>
        <div id='backBtnContainer'>
          <button id='backBtn'>
            <img></img>
            <span>${$this.setBackBtnTitle(callingModal)}</span>
          </button>
        </div>
    `
  }

  setResourceDisplayer(type, url){
    if(type == 'video'){
      new VideoPlayer(url)
    }
    if(type == 'pdf'){
      new PdfReader(url)
    }
    if(type == 'img'){
      new ImageViewer(data, url)
    }
    if(type == 'web'){
      window.open(url, '_blank')
    }
  }
}

export { ProjectDisplayer }
