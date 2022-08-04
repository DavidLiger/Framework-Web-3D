import { CookieManager } from '../../../../../../build/gltfLib/CookieManager.js';

var $this;
var dataJSON;
var cookieManager;
var isOpen = false;
var btnClick = false;
var btnIsRunningFlag = false;
var openTimeOut;
var contextDetector;
var openWidth = 246;
var openHeight = 114;
var type;
var hideOrShowPathHelper;
var hideOrShowProjectsHelper;
var cookies = {
  'hidePathHelper':'',
  'hideProjectsHelper':''
};
var domElements ={
  'pathElements':[`
    <button id="modalHelp" class="left"></button><img id="modalHelpBtnImg" class="left"></img>
    <div id="modalHelpInfo" class="left">
    <p id="modalHelpInfoTitle" class="left">Navigation dans '\Parcours\'</p>
    <div id="modalHelpInfoTextContainer"></div>
    <div id ="hideModalHelperContainer"><label><input type="checkbox" id="hideModalHelper" value="value"> Ne plus afficher</label></div>
    </div>`
  ],
  'projectsElements':[`
    <button id="modalHelp" class="left"></button><img id="modalHelpBtnImg" class="left"></img>
    <div id="modalHelpInfo" class="left">
    <p id="modalHelpInfoTitle" class="left">Navigation dans '\Technos\'</p>
    <div id="modalHelpInfoTextContainer"></div>
    <div id ="hideModalHelperContainer"><label><input type="checkbox" id="hideModalHelper" value="value"> Ne plus afficher</label></div>
    </div>`
  ]

};
var data = {
  'path':{'pc':{'text':`<p id="pathInfoTxt">Parcourez mon CV :</p>
                          <p style="margin-top:5px"><b> - En cliquant sur les années</b> : vous verrez mon parcours par période</p>
                          <p><b> - En cliquant sur les projets</b> : vous consulterez le détail des projets</p>`},
              'mobile':{'text':`<p id="pathInfoTxt">Parcourez mon CV :</p>
                          <p style="margin-top:5px"><b> - En touchant les années</b> : vous verrez mon parcours par période</p>
                          <p><b> - En touchant les projets</b> : vous consulterez le détail des projets</p>`}
            },
  'projects':{'pc':{'text':`<p id="pathInfoTxt">Parcourez les projets par techno :</p>
                          <p style="margin-top:5px"><b> - En cliquant sur les technos</b> : vous verrez les projets concernés</p>
                          <p><b> - Puis en cliquant sur les projets</b> : vous en consulterez le détail</p>`},
              'mobile':{'text':`<p id="pathInfoTxt">Parcourez les projets par techno :</p>
                          <p style="margin-top:5px"><b> - En touchant les technos</b> : vous verrez les projets concernés</p>
                          <p><b> - Puis en touchant les projets</b> : vous en consulterez le détail</p>`}
            }
}

class ModalHelper {
  constructor(contextDetect, dataJSONToHandle, typeToHandle) {
    $this = this;
    dataJSON = dataJSONToHandle;
    contextDetector = contextDetect;
    type = typeToHandle;
    cookieManager = new CookieManager();
    $this.init()
    $this.controller();
  }



  controller(){
    $(document).on("click","#modalHelpBtnImg", function(e){
      btnClick = true;
      if(btnClick && !btnIsRunningFlag){
        btnIsRunningFlag = true;
        $('#modalHelpBtnImg').prop('disabled', true);
        $('#modalHelpBtnImg').css('opacity', '0.5');
        $this.openCloseHelp();
        e.stopPropagation();
      }
      setTimeout(function(){
        btnClick = false;
        btnIsRunningFlag = false
        $('#modalHelpBtnImg').prop('disabled', false);
        $('#modalHelpBtnImg').css('opacity', '1');
      },1000)
    })
    $(document).on("click","#hideModalHelperContainer input", function(e){
      $this.setCookies()
      $this.closeHelp()
    })
    $(document).on("click","#hideModalHelperContainer label", function(e){
      $this.setCookies()
      $this.closeHelp()
    })
    $(window).on('click', function(e){
      if(dataJSON.modalHelper.on){
        let el = $(e.target);
        if(el.attr("id") != 'modalHelp' &&
          el.attr("id") != 'modalHelpInfoTitle' &&
          el.attr("id") != 'pathInfoTxt' &&
          el.attr("id") != 'modalHelpInfoTextContainer' &&
          el.attr("id") != 'hideModalHelperContainer' &&
          el.attr("id") != 'hideModalHelper' &&
          el.attr("id") != 'modalHelpInfo' &&
          el.parent().attr("id") != 'modalHelpInfo' &&
          el.parent().attr("id") != 'modalHelpInfoTextContainer' &&
          el.parent().attr("id") != 'hideModalHelperContainer'){
          $this.closeHelp()
        }
      }
    })
  }

  setCookies(){
    if($("#hideModalHelperContainer input").is(':checked')){
      if(type == 'path'){
        cookies.hidePathHelper = true
      }else{
        cookies.hideProjectsHelper = true
      }
    }else{
      if(type == 'path'){
        cookies.hidePathHelper = false
      }else{
        cookies.hideProjectsHelper = false
      }
    }
    cookieManager.bakeCookie('userPrefs',cookies);
  }

  inject(){
    return new Promise(function(resolve){
      let elements;
      if(type == 'path'){
        elements = domElements.pathElements
      }else{
        elements = domElements.projectsElements
      }
      resolve(elements.forEach((element) => {
        document.querySelector('#modalHelperContainer').insertAdjacentHTML('beforeend', element)
      }))
    })
  }

  injectCSS(){
    let modalHelperCSS = document.getElementById('modalHelperCSS')
    if(!modalHelperCSS){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','modalHelperCSS');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/ModalHelper/ModalHelper.css');
      document.head.appendChild(cssLink);
    }
  }

  async init(){
    await $this.inject().then(function(){
      // $this.injectCSS()
      if(contextDetector.mobileDetector() == 'mobile'){
        if(type == 'path'){
          $("#modalHelpInfoTextContainer").html(`${data.path.mobile.text}`)
        }else{
          $("#modalHelpInfoTextContainer").html(`${data.projects.mobile.text}`)
        }
        // $("#modalHelpInfo").css("height","154px");
        // $this.reloadCSS('UIHelper');
      }else{
        if(type == 'path'){
          $("#modalHelpInfoTextContainer").html(`${data.path.pc.text}`)
        }else{
          $("#modalHelpInfoTextContainer").html(`${data.projects.pc.text}`)
        }
      }
      //if nozoom cache le zoom zt recentre les autres elements
      if(dataJSON.modalHelper.side == 'right'){
        document.getElementById("modalHelp").classList.remove('left');
        document.getElementById("modalHelp").classList.add('right');
        document.getElementById("modalHelpBtnImg").classList.remove('left');
        document.getElementById("modalHelpBtnImg").classList.add('right');
        document.getElementById("modalHelpInfo").classList.remove('left');
        document.getElementById("modalHelpInfo").classList.add('right');
        $this.reloadCSS('UIHelper');
      }
      if(dataJSON.modalHelper.hasOwnProperty('fontFamily')){
        let font = dataJSON.modalHelper.fontFamily;
        $this.reloadCSS('UIHelper');
      }
      if(type == 'path'){
        let hidePathHelper = cookieManager.readCookie('userPrefs')
        if(hidePathHelper === null){
          cookies.hidePathHelper = false
          cookieManager.bakeCookie('userPrefs',cookies);
        }else{
          if(cookieManager.readCookie('userPrefs').hidePathHelper){
            $("#hideModalHelperContainer input").prop('checked', true)
          }else{
            $("#hideModalHelperContainer input").prop('checked', false)
          }
        }
      }else{
        let hidePathHelper = cookieManager.readCookie('userPrefs')
        if(hidePathHelper === null){
          cookies.hideProjectsHelper = false
          cookieManager.bakeCookie('userPrefs',cookies);
        }else{
          if(cookieManager.readCookie('userPrefs').hideProjectsHelper){
            $("#hideModalHelperContainer input").prop('checked', true)
          }else{
            $("#hideModalHelperContainer input").prop('checked', false)
          }
        }
      }
      $this.initPathHelper()
    })
  }

  checkForCookies(){
    return new Promise(function(resolve){
      hideOrShowProjectsHelper = cookieManager.readCookie('userPrefs').hideProjectsHelper
      resolve(
        hideOrShowPathHelper = cookieManager.readCookie('userPrefs').hidePathHelper
      )
    })
  }

  async initPathHelper(){
    await $this.checkForCookies().then(function(){
      setTimeout(function(){
        if(dataJSON.modalHelper.on){
          $this.showHelp()
        }
      }, 2500)
      if(type == 'path'){
        if(dataJSON.modalHelper.on &&
          dataJSON.modalHelper.autoOpen &&
          !hideOrShowPathHelper){
          setTimeout(function(){
            $this.openCloseHelp()
          }, 2500)
          setTimeout(function(){
              $this.closeHelp()
          }, 9500)
        }
      }else{
        if(dataJSON.modalHelper.on &&
          dataJSON.modalHelper.autoOpen &&
          !hideOrShowProjectsHelper){
          setTimeout(function(){
            $this.openCloseHelp()
          }, 2500)
          setTimeout(function(){
              $this.closeHelp()
          }, 9500)
        }
      }
    })
  }

  reloadCSS(cssSheet){
    let link = document.getElementById(cssSheet);
    link.href = link.href + "?id=" + new Date().getMilliseconds();
  }

  openCloseHelp(){
    if(isOpen == false){
      $("#modalHelp").animate({width: '+='+openWidth+'px'}, 100);
      $("#modalHelp").animate({height: '+='+openHeight+'px'}, 80);
      $('#modal').removeClass('modalNormalRadius')
      $('#modal').removeClass('modalHelperClosedRadius')
      $('#modal').addClass('modalHelperOpenRadius');
      $("#modalHelp").css("border-radius","18px 24px 18px 18px");
      $("#modalHelpInfo").css("border-radius","16px 22px 16px 16px");
      //modalHelpBtnImg
      $("#modalHelpBtnImg").css("top","13px");
      $("#modalHelpBtnImg").css("content","url('../../../../../build/assets/images/cross_circle.png')")
      if(dataJSON.modalHelper.side == 'right'){
        $("#modalHelpBtnImg").animate({right: '+='+openWidth+'px'}, 100);
      }else{
        $("#modalHelpBtnImg").animate({left: '+='+(openWidth+2)+'px'}, 100);
      }
      $("#modalHelpInfo").css("visibility","visible").fadeIn(1000);
      isOpen = true;
      openTimeOut = setTimeout(function(){ $this.closeHelp();}, 10000);
    }else{
      $this.closeHelp();
    }
  }

  closeHelp(){
    if(isOpen == true){
      $("#modalHelp").animate({width: '-='+openWidth+'px'}, 50);
      $("#modalHelp").animate({height: '-='+openHeight+'px'}, 100);
      $('#modal').removeClass('modalNormalRadius')
      $('#modal').removeClass('modalHelperOpenRadius')
      $('#modal').addClass('modalHelperClosedRadius');
      $("#modalHelp").css("border-radius","28px");
      $("#modalHelpInfo").css("border-radius","28px");
      $("#modalHelpBtnImg").css("top","15px");
      $("#modalHelpBtnImg").css("content","url('../../../../../build/MVCComponents/ViewComponent/UIHelper/images/info-circle.png')")
      if(dataJSON.modalHelper.side == 'right'){
        $("#modalHelpBtnImg").animate({right: '-='+openWidth+'px'}, 100);
      }else{
        $("#modalHelpBtnImg").animate({left: '-='+(openWidth+2)+'px'}, 100);
      }
      $("#modalHelpInfo").css("visibility","visible").fadeOut(120);
      clearTimeout(openTimeOut);
      isOpen = false;
    }
  }

  hideHelp(){
    $("#modalHelp").css("visibility","visible").fadeOut(120);
    $("#modalHelpInfo").css("visibility","visible").fadeOut(120);
  }

  showHelp(){
    $("#modalHelp").css("visibility","visible").fadeIn(120);
  }

  getIsOpen(){
    return isOpen;
  }
}

export { ModalHelper }
