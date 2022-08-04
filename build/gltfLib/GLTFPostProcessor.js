import { RenderPass } from '../lib/RenderPass.js';
import { ShaderPass } from '../lib/ShaderPass.js';
import { RGBShiftShader } from '../lib/RGBShiftShader.js';
import { DotScreenShader } from '../lib/DotScreenShader.js';

var $this;
var scene;
var composer;

class GLTFPostProcessor {

  constructor(composerToHandle) {
    $this = this;
    composer = composerToHandle;
  }

  process(renderer, scene, camera, userData){
    let renderpass = new RenderPass( scene, camera )
    renderpass.renderToScreen = true;
    composer.addPass(renderpass);
    // NB
    if(userData.dataJSON.scene.postProcessing.blackNWhite.on){
      const params = userData.dataJSON.scene.postProcessing.blackNWhite;
      const effect = new ShaderPass( DotScreenShader );
      effect.uniforms[ 'tDiffuse' ].value = params.tDiffuse;
      effect.uniforms[ 'tSize' ].value = params.tSize;
      effect.uniforms[ 'center' ].value = params.center;
      effect.uniforms[ 'angle' ].value = params.angle;
      effect.uniforms[ 'scale' ].value = params.scale;
      composer.addPass( effect );
    }
    // OLD TV
    if(userData.dataJSON.scene.postProcessing.oldTV.on){
      const params = userData.dataJSON.scene.postProcessing.oldTV;
      const effect = new ShaderPass( DotScreenShader );
      effect.uniforms[ 'tDiffuse' ].value = params.tDiffuse;
      effect.uniforms[ 'tSize' ].value = params.tSize;
      effect.uniforms[ 'center' ].value = params.center;
      effect.uniforms[ 'angle' ].value = params.angle;
      effect.uniforms[ 'scale' ].value = params.scale;
      composer.addPass( effect );
    }
    // TV RGB MORT
    if(userData.dataJSON.scene.postProcessing.deadTV.on){
      const effect = new ShaderPass( RGBShiftShader );
      effect.uniforms[ 'tDiffuse' ].value = userData.dataJSON.scene.postProcessing.deadTV.amount;
      effect.uniforms[ 'amount' ].value = userData.dataJSON.scene.postProcessing.deadTV.amount;
      effect.uniforms[ 'angle' ].value = userData.dataJSON.scene.postProcessing.deadTV.angle;
      composer.addPass( effect );
    }
    return composer;
  }

}

export {GLTFPostProcessor}
