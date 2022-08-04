class ContextDetector {
  constructor() {
    if(!document.getElementById('jQueryScriptMobile')){
      var jQueryScriptMobile = document.createElement('script');
      jQueryScriptMobile.setAttribute('id','jQueryScriptMobile');
      jQueryScriptMobile.setAttribute('src','//code.jquery.com/mobile/1.5.0-alpha.1/jquery.mobile-1.5.0-alpha.1.min.js');
      document.head.appendChild(jQueryScriptMobile);
    }
  }

  getBrowser() {
    let browser = navigator.userAgent.split('/');
    // console.log(browser);
    browser = browser[browser.length-2];
    browser = browser.replace(/[^a-zA-Z]+/g, '');
    return browser;
  }

  mobileDetector(){
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
     return 'mobile'
   }else{
     return 'PC'
   }
  }

  isWebGLCompatible(){
    let canvas = document.createElement("canvas");
    let gl = canvas.getContext("webgl")
      || canvas.getContext("experimental-webgl");
    // Report the result.
    if (gl && gl instanceof WebGLRenderingContext) {
      return true
    } else {
      return false
    }
  }

  getVideoCardInfo(){
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) {
      return {
        error: "no webgl",
      };
    }
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer:  gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    } : {
      error: "no WEBGL_debug_renderer_info",
    };
  }

  languageDetector(){
    return navigator.language || navigator.userLanguage;
  }
}

export { ContextDetector }
