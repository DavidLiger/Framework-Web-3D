var data;
var cursor;
var imgCursor = 0;
var autoSlide;
var arrowClick = false;
var arrowIsRunningFlag = false;
var autoSliderFlag = false;
var userClickArrowFlag = false;
var elements = `<img id='arrow_L'>
                <img id="slideImg" src=''>
                <img id='arrow_R'>`;
var $this;

class Carousel {

  constructor(dataToHandle, cursorToHandle){
    data = '';
    data = dataToHandle;
    cursor = cursorToHandle;
    $this = this;
    $this.init()
  }

  init(){
    // $this.injectCSS();
    $this.controller();
    if(autoSlide == 'undefined' || autoSlide == '' || autoSlide == null){
      $this.autoSlide();
    }
  }

  injectCSS(){
    let timeStepperCSS = document.getElementById('carouselCSS')
    if(!timeStepperCSS){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','carouselCSS');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/Carousel/Carousel.css');
      document.head.appendChild(cssLink);
    }
  }

  controller(){
    $(document).on('click','#arrow_R',function(){
      arrowClick = true;
      if(arrowClick && !arrowIsRunningFlag){
        $this.setSlideImage('up')
        arrowIsRunningFlag = true;
        userClickArrowFlag = true;
        $('#arrow_R').prop('disabled', true);
        $('#arrow_R').css('opacity', '0.5');
        $this.resetUserClickArrowFlag()
      }
      setTimeout(function(){
        arrowClick = false;
        arrowIsRunningFlag = false
        $('#arrow_R').prop('disabled', false);
        $('#arrow_R').css('opacity', '1');
      },1000)
    })
    $(document).on('click','#arrow_L',function(){
      arrowClick = true;
      if(arrowClick && !arrowIsRunningFlag){
        $this.setSlideImage('down')
        arrowIsRunningFlag = true;
        userClickArrowFlag = true;
        $('#arrow_L').prop('disabled', true);
        $('#arrow_L').css('opacity', '0.5');
      }
      setTimeout(function(){
        arrowClick = false;
        arrowIsRunningFlag = false
        $('#arrow_L').prop('disabled', false);
        $('#arrow_L').css('opacity', '1');
        $this.resetUserClickArrowFlag()
      },1000)
    })
  }

  autoSlide(){
    autoSlide = setInterval(function () {
      if(!autoSliderFlag && !userClickArrowFlag){
        $this.setSlideImage('up')
        autoSliderFlag = true
      }
      setTimeout(function(){
        autoSliderFlag = false
      },7500)
    }, 8000);
  }

  resetUserClickArrowFlag(){
    if(userClickArrowFlag){
      setTimeout(function(){
        userClickArrowFlag = false
      },5000)
    }
  }

  setSlideImage(direction){
    let imgs;
    let length;
    if(Array.isArray(data)){
      imgs = data[cursor].img;
      length = imgs.length;
      $('#slideImg').fadeOut('normal', function(){
        if(direction == 'up'){
          if(imgCursor < length-1){
            $('#slideImg').attr('src', data[cursor].img[imgCursor+1])
            imgCursor++
          }else{
            $('#slideImg').attr('src', data[cursor].img[0])
            imgCursor = 0
          }
        }else{
          if(imgCursor > 0){
            $('#slideImg').attr('src', data[cursor].img[imgCursor-1])
            imgCursor--
          }else{
            $('#slideImg').attr('src', data[cursor].img[imgs.length-1])
            imgCursor = length-1
          }
        }
      })
      $('#slideImg').fadeIn('normal')
    }else{
      imgs = data.img;
      length = imgs.length;
      $('#slideImg').fadeOut('normal', function(){
        if(direction == 'up'){
          if(imgCursor < length-1){
            $('#slideImg').attr('src', data.img[imgCursor+1])
            imgCursor++
          }else{
            $('#slideImg').attr('src', data.img[0])
            imgCursor = 0
          }
        }else{
          if(imgCursor > 0){
            $('#slideImg').attr('src', data.img[imgCursor-1])
            imgCursor--
          }else{
            $('#slideImg').attr('src', data.img[imgs.length-1])
            imgCursor = length-1
          }
        }
      })
      $('#slideImg').fadeIn('normal')
    }

  }

  getElements(){
    return elements
  }

  initSlider(cursor){
    $this.setCursor(cursor)
    if(Array.isArray(data)){
      $('#slideImg').attr('src',data[cursor].img[0])
    }else{
      $('#slideImg').attr('src',data.img[0])
    }

  }

  setCursor(indice){
    cursor = indice
  }

  resetArrowClick(){
    arrowClick = false;
  }
}

export {Carousel}
