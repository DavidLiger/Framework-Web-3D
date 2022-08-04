import { CookieManager } from '../../../../../../build/gltfLib/CookieManager.js';

var $this;
var dataJSON;
var cookieManager;
var isOpen = false;
var btnClick = false;
var btnIsRunningFlag = false;
var openTimeOut;
var contextDetector;
var openWidth = 250;
var openHeight = 104;
var type;
var cookies = {
  'hidePathHelper':'',
  'hideProjectsHelper':''
};
var domElements ={
  'pathElements':[`
    <button id="pathHelp" class="left"></button><img id="pathHelpBtnImg" class="left"></img>
    <div id="pathHelpInfo" class="left">
    <p id="pathHelpInfoTitle" class="left">Navigation dans '\Parcours\'</p>
    <div id="pathHelpInfoTextContainer"></div>
    <div id ="hidePathHelperContainer"><label><input type="checkbox" id="hidePathHelper" value="value"> Ne plus afficher</label></div>
    </div>`
  ],
  'projectsElements':[`
    <button id="pathHelp" class="left"></button><img id="pathHelpBtnImg" class="left"></img>
    <div id="pathHelpInfo" class="left">
    <p id="pathHelpInfoTitle" class="left">Navigation dans '\Technos\'</p>
    <div id="pathHelpInfoTextContainer"></div>
    <div id ="hidePathHelperContainer"><label><input type="checkbox" id="hidePathHelper" value="value"> Ne plus afficher</label></div>
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

class PathHelper {
  constructor(contextDetect, dataJSONToHandle, typeToHandle) {
    $this = this;
    dataJSON = dataJSONToHandle;
    contextDetector = contextDetect;
    type = typeToHandle;
    cookieManager = new CookieManager();
    $this.init()
    $this.initPathHelper()
    $this.controller();
  }



  controller(){
    $(document).on("click","#pathHelpBtnImg", function(e){
      btnClick = true;
      if(btnClick && !btnIsRunningFlag){
        btnIsRunningFlag = true;
        $('#pathHelpBtnImg').prop('disabled', true);
        $('#pathHelpBtnImg').css('opacity', '0.5');
        $this.openCloseHelp();
        e.stopPropagation();
      }
      setTimeout(function(){
        btnClick = false;
        btnIsRunningFlag = false
        $('#pathHelpBtnImg').prop('disabled', false);
        $('#pathHelpBtnImg').css('opacity', '1');
      },1000)
    })
    $(document).on("click","#hidePathHelperContainer input", function(e){
      $this.setCookies()
      $this.closeHelp()
    })
    $(document).on("click","#hidePathHelperContainer label", function(e){
      $this.setCookies()
      $this.closeHelp()
    })
    $(window).on('click', function(e){
      if(dataJSON.path.pathHelper.on){
        let el = $(e.target);
        if(el.attr("id") != 'pathHelp' &&
          el.attr("id") != 'pathHelpInfoTitle' &&
          el.attr("id") != 'pathInfoTxt' &&
          el.attr("id") != 'pathHelpInfoTextContainer' &&
          el.attr("id") != 'hidePathHelperContainer' &&
          el.attr("id") != 'hidePathHelper' &&
          el.attr("id") != 'pathHelpInfo' &&
          el.parent().attr("id") != 'pathHelpInfo' &&
          el.parent().attr("id") != 'pathHelpInfoTextContainer' &&
          el.parent().attr("id") != 'hidePathHelperContainer'){
          $this.closeHelp()
        }
      }
    })
  }

  setCookies(){
    if($("#hidePathHelperContainer input").is(':checked')){
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

  async init(){
    await $this.inject().then(function(){
      let pathHelperCSS = document.getElementById('pathHelperCSS')
      if(!pathHelperCSS){
        let cssLink = document.createElement('link');
        cssLink.setAttribute('id','pathHelperCSS');
        cssLink.setAttribute('type','text/css');
        cssLink.setAttribute('rel','stylesheet');
        cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/ModalHelpers/PathHelper/PathHelper.css');
        document.head.appendChild(cssLink);
      }
      if(contextDetector.mobileDetector() == 'mobile'){
        if(type == 'path'){
          $("#pathHelpInfoTextContainer").html(`${data.path.mobile.text}`)
        }else{
          $("#pathHelpInfoTextContainer").html(`${data.projects.mobile.text}`)
        }
        $("#pathHelpInfo").css("height","144px");
        $this.reloadCSS('UIHelper');
      }else{
        if(type == 'path'){
          $("#pathHelpInfoTextContainer").html(`${data.path.pc.text}`)
        }else{
          $("#pathHelpInfoTextContainer").html(`${data.projects.pc.text}`)
        }
      }
      //if nozoom cache le zoom zt recentre les autres elements
      if(dataJSON.path.pathHelper.side == 'right'){
        document.getElementById("pathHelp").classList.remove('left');
        document.getElementById("pathHelp").classList.add('right');
        document.getElementById("pathHelpBtnImg").classList.remove('left');
        document.getElementById("pathHelpBtnImg").classList.add('right');
        document.getElementById("pathHelpInfo").classList.remove('left');
        document.getElementById("pathHelpInfo").classList.add('right');
        $this.reloadCSS('UIHelper');
      }
      if(dataJSON.path.pathHelper.hasOwnProperty('fontFamily')){
        let font = dataJSON.path.pathHelper.fontFamily;
        $this.reloadCSS('UIHelper');
      }
      if(type == 'path'){
        let hidePathHelper = cookieManager.readCookie('userPrefs')
        if(hidePathHelper === null){
          cookies.hidePathHelper = false
          cookieManager.bakeCookie('userPrefs',cookies);
        }else{
          if(cookieManager.readCookie('userPrefs').hidePathHelper){
            $("#hidePathHelperContainer input").prop('checked', true)
          }else{
            $("#hidePathHelperContainer input").prop('checked', false)
          }
        }
      }else{
        let hidePathHelper = cookieManager.readCookie('userPrefs')
        if(hidePathHelper === null){
          cookies.hideProjectsHelper = false
          cookieManager.bakeCookie('userPrefs',cookies);
        }else{
          if(cookieManager.readCookie('userPrefs').hideProjectsHelper){
            $("#hidePathHelperContainer input").prop('checked', true)
          }else{
            $("#hidePathHelperContainer input").prop('checked', false)
          }
        }
      }
    })
  }

  initPathHelper(){
    setTimeout(function(){
      if(dataJSON.path.pathHelper.on){
        $this.showHelp()
      }
    }, 2500)
    if(type == 'path'){
      let hideOrShowPathHelper = cookieManager.readCookie('userPrefs').hidePathHelper;
      if(hideOrShowPathHelper != null){
        if(dataJSON.path.pathHelper.on &&
          dataJSON.path.pathHelper.autoOpen &&
          !hideOrShowPathHelper){
          setTimeout(function(){
            $this.openCloseHelp()
          }, 2500)
          setTimeout(function(){
              $this.closeHelp()
          }, 9500)
        }
      }
    }else{
      let hideOrShowPathHelper = cookieManager.readCookie('userPrefs').hideProjectsHelper;
      if(hideOrShowPathHelper != null){
        if(dataJSON.path.pathHelper.on &&
          dataJSON.path.pathHelper.autoOpen &&
          !hideOrShowPathHelper){
          setTimeout(function(){
            $this.openCloseHelp()
          }, 2500)
          setTimeout(function(){
              $this.closeHelp()
          }, 9500)
        }
      }
    }
  }

  reloadCSS(cssSheet){
    let link = document.getElementById(cssSheet);
    link.href = link.href + "?id=" + new Date().getMilliseconds();
  }

  openCloseHelp(){
    if(isOpen == false){
      $("#pathHelp").animate({width: '+='+openWidth+'px'}, 100);
      $("#pathHelp").animate({height: '+='+openHeight+'px'}, 200);
      $("#pathHelpBtnImg").css("content","url('../../../../../build/assets/images/cross_circle.png')")
      if(dataJSON.path.pathHelper.side == 'right'){
        $("#pathHelpBtnImg").animate({right: '+='+openWidth+'px'}, 100);
      }else{
        $("#pathHelpBtnImg").animate({left: '+='+openWidth+'px'}, 100);
      }
      $("#pathHelpInfo").css("visibility","visible").fadeIn(1000);
      isOpen = true;
      openTimeOut = setTimeout(function(){ $this.closeHelp();}, 10000);
    }else{
      $this.closeHelp();
    }
  }

  closeHelp(){
    if(isOpen == true){
      $("#pathHelp").animate({width: '-='+openWidth+'px'}, 50);
      $("#pathHelp").animate({height: '-='+openHeight+'px'}, 100);
      $("#pathHelpBtnImg").css("content","url('../../../../../build/MVCComponents/ViewComponent/UIHelper/images/info-circle.png')")
      if(dataJSON.path.pathHelper.side == 'right'){
        $("#pathHelpBtnImg").animate({right: '-='+openWidth+'px'}, 100);
      }else{
        $("#pathHelpBtnImg").animate({left: '-='+openWidth+'px'}, 100);
      }
      $("#pathHelpInfo").css("visibility","visible").fadeOut(120);
      clearTimeout(openTimeOut);
      isOpen = false;
    }
  }

  hideHelp(){
    $("#pathHelp").css("visibility","visible").fadeOut(120);
    $("#pathHelpInfo").css("visibility","visible").fadeOut(120);
  }

  showHelp(){
    $("#pathHelp").css("visibility","visible").fadeIn(120);
  }

  getIsOpen(){
    return isOpen;
  }
}

export { PathHelper }
