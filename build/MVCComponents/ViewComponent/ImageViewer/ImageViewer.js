var $this;
var data;
var imgName;
var elements = `
      <div id="imageViewerContainer">
        <div id="viewerContainer"></div>
        <span id='loadingMsg'>Chargement...</span>
        <button id="closeViewer"><img></img></button>
        <div id="imageViewerOpacScreen"></div>
      </div>`;

class ImageViewer {

  constructor(dataToHandle, imgNameToHandle) {
    $this = this;
    data = dataToHandle;
    imgName = imgNameToHandle;
    // $this.injectCSS()
    $this.init()
    $this.controller()
  }

  controller(){
    $(document).on('click', '#closeViewer', function(){
      $this.closeViewer()
    })
    window.addEventListener('resize', function() {
      $this.centerImg()
    }, true);
  }

  injectCSS(){
    let imageViewerCSS = document.getElementById('imageViewerCSS')
    if(!imageViewerCSS){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','imageViewerCSS');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/ImageViewer/ImageViewer.css');
      document.head.appendChild(cssLink);
    }
  }

  init(){
    let imageViewerContainer = document.getElementById('imageViewerContainer')
    if(!imageViewerContainer){
      document.querySelector('#container').insertAdjacentHTML('beforebegin', elements)
    }
    $('#viewerContainer').empty()
    document
    .querySelector('#viewerContainer')
    .insertAdjacentHTML(
      'beforeend',
      `<div id="imgContainer"></div>
      <div id="legendContainer"></div>`
    )
    $this.showImgViewer()
  }

  setImgViewer(){
    Object.entries(data.img).forEach(([key, value]) => {
      Object.entries(value).forEach(([valKey, valValue]) => {
        if(valKey == 'name' && valValue == imgName){
          $('#imgContainer').html(`<img src="${value.url}">`)
          $('#legendContainer').html(`<span>${value.legend}</span>`)
        }
      });
    });
    $('#loadingMsg').hide()
    $this.centerImg()
  }

  centerImg(){
    if($('#imgContainer').height() < $('#imgContainer img').height()){
      $('#imgContainer').css('align-items','flex-start')
    }else{
      $('#imgContainer').css('align-items','center')
    }
  }

  showImgViewer(){
    $('#imageViewerContainer').css('visibility','visible')
    $('#loadingMsg').show()
    $this.setImgViewer()
  }

  closeViewer(){
    $('#imageViewerContainer').css('visibility','hidden')
    $('#viewerContainer').empty()
  }

}

export { ImageViewer }
