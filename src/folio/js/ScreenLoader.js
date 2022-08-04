var $this;
var domElements =
`<div id="screenLoader">
<img></img>
<div>
<span></span>
</div>
<p>0 %</p>
</div>`

class ScreenLoader {

  constructor() {
    $this = this;
    $this.injectInDom();
    $this.setLoadingBar();
  }

  injectInDom(){
    document.querySelector('#container').insertAdjacentHTML('beforebegin', domElements)
  }

  setLoadingBar(value){
    if(value != 50 && value != 'undefined' && value != '' && value != null){
      $('#screenLoader span').css('width',(value/4)+'vw');
      $('#screenLoader p').text(value+' %');
      $('#screenLoader p').css('left',38+(value/4)+'vw');
    }
    if(value == 100){
      setTimeout(function(){
        $("#screenLoader").hide()
      },150)
    }
  }

}
export { ScreenLoader }
