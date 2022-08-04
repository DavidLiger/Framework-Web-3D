import {Carousel} from '../Carousel/Carousel.js';
import {ModalHelper} from '../ModalHelper/ModalHelper.js';
import { CookieManager } from '../../../../../build/gltfLib/CookieManager.js';

var data;
var dataJSON;
var cursor = 0;
var actualCursorPos = 5;
var yearIconClick = false;
var isRunningFlag = false;
var carousel;
var contextDetector;
var cookieManager;
var modal;
var $this;

class TimeStepper {

  constructor(containerId, contextDetectorToHandle, dataToHandle, dataJSONToHandle, modalToHandle){
    contextDetector = contextDetectorToHandle;
    cookieManager = new CookieManager();
    data = dataToHandle;
    dataJSON = dataJSONToHandle;
    modal = modalToHandle;
    $this = this;
    carousel = new Carousel(data, cursor)
    if(dataJSON.modalHelper.on){
      new ModalHelper(contextDetector, dataJSON, 'path');
    }
    $this.init(containerId)
  }

  init(containerId){
    $this.setHtmlWithData(containerId);
    // $this.injectCSS();
    $this.controller();
  }

  injectCSS(){
    let timeStepperCSS = document.getElementById('timeStepperCSS')
    if(!timeStepperCSS){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','timeStepperCSS');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/TimeStepper/TimeStepper.css');
      document.head.appendChild(cssLink);
    }
  }

  controller(){
    $this.setIconsRotate()
    window.addEventListener('resize', function(event) {
      $this.setIconsRotate()
    }, true);
    $(document).on('click','.yearIcon',function(e){
      yearIconClick = true;
      if(yearIconClick && !isRunningFlag){
        cursor = $(this).attr('data-value');
        carousel.setCursor(cursor);
        $this.updateHtml();
        $this.setYearIconColor();
        $this.setTimerOnce();
        isRunningFlag = true;
      }
    })
    $(document).on('click','.projectBtn',function(){
      modal.setModal('projectDisplayer', $(this).attr('data-name'));
    })
  }

  setIconsRotate(){
    if(window.innerWidth < 620){
      $('.yearIcon').css({'transform': 'translateX(-50%) translateY(50%) rotate(-45deg)'});
    }else{
      $('.yearIcon').css({'transform': 'translateX(-25%) rotate(0deg)'});
    }
  }

  setTimeStepperWidth(){
    return new Promise(resolve=>{
      let newWidth
      if(cursor > actualCursorPos){
        let size = 14.2 * (cursor - actualCursorPos);
        newWidth = `-=${size}%`
      }
      if(cursor < actualCursorPos){
        let size = 14.2 * (actualCursorPos - cursor);
        newWidth = `+=${size}%`
      }
      resolve($("#timeLineStepper").animate({width: newWidth}, 400))
    })
  }

  async setTimerOnce(){
    await $this.setTimeStepperWidth().then(function(){
      actualCursorPos = cursor;
      isRunningFlag = false;
    })
  }

  setYearIconColor(){
    let elements = document.getElementsByClassName("yearIcon")
    for (var i = 0; i < elements.length; i++) {
      if(elements[i].getAttribute('data-value') == cursor){
        elements[i].style.backgroundImage = 'linear-gradient(rgba(34, 200, 224, 1), rgba(4, 170, 194, 1))'
        elements[i].style.color = 'white'
        elements[i].style.textShadow = '2px 2px 4px rgba(20, 20, 20, 1)'
        elements[i].style.zIndex = '300'
      }else{
        elements[i].style.backgroundImage = 'linear-gradient(rgba(255, 255, 255), rgba(255, 255, 255, 1))'
        elements[i].style.color = 'black'
        elements[i].style.textShadow = '2px 2px 4px rgba(250, 250, 250, 1)'
        elements[i].style.zIndex = '280'
      }
    }
  }

  setHtmlWithData(containerId){
    carousel.resetArrowClick()
    actualCursorPos = 5;
    $(''+containerId+'').html($this.getHtmlContent());
    $('#timeStepperImg').html(carousel.getElements());
    $('#timeStepperProjects').scrollLeft(0)
    carousel.initSlider(cursor)
    $this.updateHtml();
    $this.setYearIconColor();
    $this.setTimerOnce();
  }

  setprojectBtns(elements){
    let projectBtns = '';
    elements.forEach((element) => {
      projectBtns += `<button class="projectBtn" data-name="${element.name}"><img><span>${element.name}</span></button>`
    });
    return projectBtns
  }

  getHtmlContent(){
    return `
        <div id='timeStepperSlider'>
          <div id='timeStepperImg'></div>
          <div id='timeStepperContent'>
            <div id='timeStepperTitle'>${data[cursor].title}</div>
            <div id='textNProjectsContainer'>
              <div id='timeStepperProjects'>${$this.setprojectBtns(data[cursor].projects)}</div>
              <div id='timeStepperText'>${data[cursor].text}</div>
            </div>
          </div>
        </div>
        <div id='cursor'>
          <div id='iconsContainer'>
            <span id='firstYearLabel' class='yearIcon' data-value="0">2022</span>
            <span id='secundYearLabel' class='yearIcon' data-value="1">2021</span>
            <span id='thirstYearLabel' class='yearIcon' data-value="2">2020</span>
            <span id='fourfthYearLabel' class='yearIcon' data-value="3">2019</span>
            <span id='fifthYearLabel' class='yearIcon' data-value="4">2018</span>
            <span id='sixthYearLabel' class='yearIcon' data-value="5">2017</span>
          </div>
          <div id='timeLineStepperContainer'>
            <span id="timeLineStepper"></span>
          </div>
        </div>
    `
  }

  updateHtml(){
    carousel.initSlider(cursor)
    $('#timeStepperTitle').html(data[cursor].title);
    $('#timeStepperText').html(data[cursor].text);
    $('#timeStepperText').scrollTop(0)
    $('#timeStepperProjects').scrollLeft(0)
    $('#timeStepperProjects').html($this.setprojectBtns(data[cursor].projects));
  }
}

export { TimeStepper }
