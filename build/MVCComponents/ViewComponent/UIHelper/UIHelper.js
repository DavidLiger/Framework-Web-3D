import { CookieManager } from '../../../../../build/gltfLib/CookieManager.js';

var $this;
var gltfUI;
var dataJSON;
var cookieManager;
var isOpen = false;
var openTimeOut;
var contextDetector;
var openWidth = 246;
var openHeight = 114;
var cookies = {
  'hideUIHelper':''
};
var domElements =[
  `<button id="help" class="left"></button><img id="helpBtnImg" class="left"></img>
  <div id="helpInfo" class="left">
  <p id="helpInfoTitle" class="left">Bienvenue sur ce site web 3D</p>
  <div id="helpInfoTxtContainer"></div>
  <div id ="hideUIHelperContainer"><label><input type="checkbox" id="hideUIHelper" value="value"> Ne plus afficher</label></div>
  </div>`
];
var data = {'pc':{'text':`<p id="helpInfoTxt"><b>Explorez</b> la scène 3D :</p>
                        <p style="margin-top:5px"><b> - En zoomant</b> : à l'aide de la molette centrale de votre souris</p>
                        <p><b> - Par rotation</b> : maintenez le bouton droit de votre souris en la déplacant</p>`},
            'mobile':{'text':`<p id="helpInfoTxt"><b>Explorez</b> la scène 3D :</p>
                        <p style="margin-top:5px"><b> - En zoomant</b> : en écartant 2 doigts sur l'écran</p>
                        <p><b> - Par rotation</b> : en déplacant votre doigt sur l'écran</p>`}
          }

class UIHelper {
  constructor(gltfUIToHandle, contextDetect, dataJSONToHandle) {
    $this = this;
    gltfUI = gltfUIToHandle;
    dataJSON = dataJSONToHandle;
    contextDetector = contextDetect;
    cookieManager = new CookieManager();
    $this.init()
    $this.controller();
  }

  inject(){
    return new Promise(function(resolve){
      resolve(domElements.forEach((domElement) => {
        document.querySelector('#container').insertAdjacentHTML('beforebegin', domElement)
      }))
    })
  }

  async init(){
    await $this.inject().then(function(){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','UIHelper');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/UIHelper/UIHelper.css');
      document.head.appendChild(cssLink);
      if(contextDetector.mobileDetector() == 'mobile'){
        $("#helpInfoTxtContainer").html(`${data.mobile.text}`)
        // openHeight = 84;
        // $("#helpInfo").css("height","144px");
        $this.reloadCSS('UIHelper');
      }else{
        $("#helpInfoTxtContainer").html(`${data.pc.text}`)
      }
      //if nozoom cache le zoom zt recentre les autres elements
      if(dataJSON.scene.UIHelper.side == 'right'){
        document.getElementById("help").classList.remove('left');
        document.getElementById("help").classList.add('right');
        document.getElementById("helpBtnImg").classList.remove('left');
        document.getElementById("helpBtnImg").classList.add('right');
        document.getElementById("helpInfo").classList.remove('left');
        document.getElementById("helpInfo").classList.add('right');
        document.getElementById("move").classList.remove('left');
        document.getElementById("move").classList.add('right');
        document.getElementById("zoom").classList.remove('left');
        document.getElementById("zoom").classList.add('right');
        document.getElementById("mouseLMBImg").classList.remove('left');
        document.getElementById("mouseLMBImg").classList.add('right');
        document.getElementById("mouseMMBImg").classList.remove('left');
        document.getElementById("mouseMMBImg").classList.add('right');
        $this.reloadCSS('UIHelper');
      }
      if(dataJSON.scene.UIHelper.hasOwnProperty('fontFamily')){
        let font = dataJSON.scene.UIHelper.fontFamily;
        // document.getElementById("move").classList.add(font);
        // document.getElementById("zoom").classList.add(font);
        $this.reloadCSS('UIHelper');
      }
      let hideUIHelper = cookieManager.readCookie('UIHelper')
      if(hideUIHelper === null){
        cookies.hideUIHelper = false
        cookieManager.bakeCookie('UIHelper',cookies);
      }else{
        if(cookieManager.readCookie('UIHelper').hideUIHelper){
          $("#hideUIHelperContainer input").prop('checked', true)
        }else{
          $("#hideUIHelperContainer input").prop('checked', false)
        }
      }
    })
  }

  reloadCSS(cssSheet){
    let link = document.getElementById(cssSheet);
    link.href = link.href + "?id=" + new Date().getMilliseconds();
  }

  controller(){
    $(document).on("click","#helpBtnImg", function(e){
      $this.openCloseHelp();
      e.stopPropagation();
    })
    $(document).on("click","#hideUIHelperContainer input", function(e){
      if($("#hideUIHelperContainer input").is(':checked')){
        cookies.hideUIHelper = true
      }else{
        cookies.hideUIHelper = false
      }
      cookieManager.bakeCookie('UIHelper',cookies);
      $this.closeHelp()
    })
    $(document).on("click","#hideUIHelperContainer label", function(e){
      if($("#hideUIHelperContainer input").is(':checked')){
        cookies.hideUIHelper = true
      }else{
        cookies.hideUIHelper = false
      }
      cookieManager.bakeCookie('UIHelper',cookies);
      $this.closeHelp()
    })
    $(window).on('click', function(e){
      if(dataJSON.scene.UIHelper.on){
        let el = $(e.target);
        if(el.attr("id") != 'help' &&
          el.attr("id") != 'helpInfoTitle' &&
          el.attr("id") != 'helpInfoTxt' &&
          el.attr("id") != 'helpInfoTxtContainer' &&
          el.attr("id") != 'hideUIHelperContainer' &&
          el.attr("id") != 'hideUIHelper' &&
          el.attr("id") != 'helpInfo' &&
          el.parent().attr("id") != 'helpInfo' &&
          el.parent().attr("id") != 'helpInfoTxtContainer' &&
          el.parent().attr("id") != 'hideUIHelperContainer'){
          $this.closeHelp()
        }
      }
      gltfUI.showOrHideTitle();
      gltfUI.showOrHideMenu();
    })
  }

  openCloseHelp(){
    if(isOpen == false){
      $("#help").animate({width: '+='+openWidth+'px'}, 100);
      $("#help").animate({height: '+='+openHeight+'px'}, 200);
      $("#helpBtnImg").css("content","url('../../../../../build/assets/images/cross_circle.png')")
      if(dataJSON.scene.UIHelper.side == 'right'){
        $("#helpBtnImg").animate({right: '+='+openWidth+'px'}, 100);
      }else{
        $("#helpBtnImg").animate({left: '+='+openWidth+'px'}, 100);
      }
      $("#helpInfo").css("visibility","visible").fadeIn(1000);
      isOpen = true;
      openTimeOut = setTimeout(function(){ $this.closeHelp();}, 10000);
    }else{
      $this.closeHelp();
    }
    if(dataJSON.scene.UIHelper.hideTitle){
      let width = $("#container").width();
      if(width < 1400){
        gltfUI.showOrHideTitle();
      }
    }
  }

  closeHelp(){
    if(isOpen == true){
      $("#help").animate({width: '-='+openWidth+'px'}, 50);
      $("#help").animate({height: '-='+openHeight+'px'}, 100);
      $("#helpBtnImg").css("content","url('../../../../../build/MVCComponents/ViewComponent/UIHelper/images/info-circle.png')")
      if(dataJSON.scene.UIHelper.side == 'right'){
        $("#helpBtnImg").animate({right: '-='+openWidth+'px'}, 100);
      }else{
        $("#helpBtnImg").animate({left: '-='+openWidth+'px'}, 100);
      }
      $("#helpInfo").css("visibility","visible").fadeOut(120);
      clearTimeout(openTimeOut);
      isOpen = false;
    }
    if(dataJSON.scene.UIHelper.hideTitle){
      gltfUI.showOrHideTitle();
    }
    gltfUI.showOrHideMenu();
  }

  hideHelp(){
    $("#help").css("visibility","visible").fadeOut(120);
    $("#helpInfo").css("visibility","visible").fadeOut(120);
  }

  showHelp(){
    $("#help").css("visibility","visible").fadeIn(120);
  }

  getIsOpen(){
    return isOpen;
  }
}

export { UIHelper }
