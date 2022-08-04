var $this;
var gltfUI;
var gltfVersionManager;
var dataJSON;
var domElements =[
  `<div id="perfHelp"></div>
  <img id="perfHelpBtnImg"></img>
  <div id="perfHelpInfo">
  </div>`
];
var data = {'threeVersion':{'text':`<p id="perfHelpInfoTxt">Votre appareil semble rencontrer des difficultés à afficher ce site web 3D.</p>
                          <p>Vous pouvez passer à une version classique afin d'améliorez votre experience utilisateur</p>
                          <button id="classicVersionBtn">Version classique</button>`},
            'img':{'text':`<p id="perfHelpInfoTxt">Ce site dispose d'une version 3D.</p>
                          <p>Vous pouvez passer à la version 3D et profiter d'une navigation fun et originale</p>
                          <button id="classicVersionBtn">Version 3D</button>`},
            'setWebGL':{'text':`<p id="perfHelpInfoTxt">Votre navigateur ne semble pas être configurer pour l'affichage 3D</p>
                          <p>Suivez ce <a href="https://www.yannkozon.com/blog/2161-comment-activer-webgl-dans-chrome-firefox-et-safari/">lien</a>, parametrez votre navigateur, puis cliquez sur le bouton ci-dessous pour passer à la version 3D et profiter d'une navigation fun et originale</p>
                          <button id="classicVersionBtn">Version 3D</button>`}
          }
var openWidth = 250;
var openHeight = 120;
var isOpen = false;
var openTimeOut;
var context;

class PerfHelper {
  constructor(dataJSONToHandle, gltfVersionManagerToHandle, gltfUIToHandle) {
    $this = this;
    dataJSON = dataJSONToHandle;
    gltfVersionManager = gltfVersionManagerToHandle;
    gltfUI = gltfUIToHandle;
    $this.init()
    $this.controller()
  }

  setVersionManager(versionManager){
    gltfVersionManager = versionManager
  }

  inject(){
    return new Promise(function(resolve){
      resolve(
        document.querySelector('body').insertAdjacentHTML('beforeend',domElements)
      )
    })
  }

  async init(){
    await $this.inject().then(function(){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','PerfHelper');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/PerfHelper/PerfHelper.css');
      document.head.appendChild(cssLink);
    })
  }

  controller(){
    $(document).on("click","#perfHelpBtnImg", function(e){
      $this.openCloseHelp();
      e.stopPropagation();
    })
    $(document).on("click","#classicVersionBtn", function(e){
      if(context == 'threeVersion'){
        gltfVersionManager.setGLTFURIINCookies('img')
        location.reload();
      }
      if(context == 'img'){
        gltfVersionManager.setGLTFURIINCookies('threeVersion')
        location.reload();
      }
      if(context == 'setWebGL'){
        gltfVersionManager.setGLTFURIINCookies('threeVersion')
        location.reload();
      }
    })
    $(window).on('click', function(e){
      if(dataJSON.scene.perfHelper.on){
        let el = $(e.target);
        if(el.attr("id") != 'perfHelp' &&
          el.attr("id") != 'perfHelpInfo' &&
          el.attr("id") != 'perfHelpInfoTxt'){
          $this.closeHelp()
        }
      }
      gltfUI.showOrHideTitle();
      gltfUI.showOrHideMenu();
    })
  }

  openCloseHelp(){
    let width = $("#container").width();
    if(isOpen == false){
      $("#perfHelp").animate({width: '+='+openWidth+'px'}, 100);
      $("#perfHelp").animate({height: '+='+openHeight+'px'}, 200);
      $("#perfHelpBtnImg").css("content","url('../../../../../build/assets/images/cross_circle.png')")
      if(dataJSON.scene.perfHelper.side == 'right'){
        $("#perfHelpBtnImg").animate({right: '+='+openWidth+'px'}, 100);
      }else{
        $("#perfHelpBtnImg").animate({left: '+='+openWidth+'px'}, 100);
      }
      $("#perfHelpInfo").css("visibility","visible").fadeIn(1000);
      isOpen = true;
      openTimeOut = setTimeout(function(){ $this.closeHelp();}, 6000);
    }else{
      $this.closeHelp();
    }
  }

  closeHelp(){
    if(isOpen == true){
      $("#perfHelp").animate({height: '-='+openHeight+'px'}, 50);
      $("#perfHelp").animate({width: '-='+openWidth+'px'}, 100);
      $("#perfHelpBtnImg").css("content","url('../../../../../build/MVCComponents/ViewComponent/PerfHelper/images/parameter-gear-small.png')")
      if(dataJSON.scene.perfHelper.side == 'right'){
        $("#perfHelpBtnImg").animate({right: '-='+openWidth+'px'}, 100);
      }else{
        $("#perfHelpBtnImg").animate({left: '-='+openWidth+'px'}, 100);
      }
      $("#perfHelpInfo").css("visibility","visible").fadeOut(120);
      clearTimeout(openTimeOut);
      isOpen = false;
    }
    if(gltfUI != null){
      gltfUI.showOrHideMenu();
    }
  }

  showHelp(contextType){
    context = contextType;
    if(context == 'threeVersion'){
      $("#perfHelpInfo").html(`${data.threeVersion.text}`)
    }
    if(context == 'img'){
      $("#perfHelpInfo").html(`${data.img.text}`)
      $("#perfHelpBtnImg").css("content","url('../../../../../build/MVCComponents/ViewComponent/PerfHelper/images/parameter-gear-small.png')")
    }
    if(context == 'setWebGL'){
      $("#perfHelpInfo").html(`${data.setWebGL.text}`);
      $("#perfHelpInfoTxt").css('margin-top','40px');
      $("#classicVersionBtn").css('margin-top','2px');
      if(document.getElementById('PerfHelper')){
        $this.reloadCSS('PerfHelper')
      }
    }
    $("#perfHelp").css("visibility","visible").fadeIn(120);
    $("#perfHelpBtnImg").css("visibility","visible").fadeIn(120);
  }

  reloadCSS(cssSheet){
    console.log(cssSheet);
    let link = document.getElementById(cssSheet);
    link.href = link.href + "?id=" + new Date().getMilliseconds();
  }

  getIsOpen(){
    return isOpen;
  }
}

export {PerfHelper}
