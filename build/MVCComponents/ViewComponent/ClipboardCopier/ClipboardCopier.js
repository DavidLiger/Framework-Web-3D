const elements = `<div id='clipboard' style='margin-bottom: 15px'><span id='textToClip'></span><img title="Copie dans le presse-papier"></img></div>`;
var containerId;
var text;
var $this;

class ClipboarderCopier {

  constructor(targetContainerId, textToHandle) {
    $this = this;
    text = textToHandle;
    containerId = targetContainerId;
    $this.injectCSS();
    $this.init();
    $this.controller()
  }

  init(){
    document.getElementById(containerId).innerHTML = elements;
    $("#textToClip").html(text);
  }

  injectCSS(){
    let cssLink = document.createElement('link');
    cssLink.setAttribute('id','clipboard');
    cssLink.setAttribute('type','text/css');
    cssLink.setAttribute('rel','stylesheet');
    cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/ClipboardCopier/ClipboardCopier.css');
    document.head.appendChild(cssLink);
  }

  controller(){
    $(document).on("click","#clipboard img", function(){
      $("#clipboard img").css("content","url('../../../../build/MVCComponents/ViewComponent/ClipboardCopier/images/clipboard-check-small.png')");
      navigator.clipboard.writeText(text);
    })
  }

}

export { ClipboarderCopier }
