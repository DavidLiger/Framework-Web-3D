import Stats from '../lib/stats.module.js';

var $this;
var stats;

class GLTFFpsChecker {
  constructor() {
    $this = this;
    stats = Stats();
  }

  getFPSState(){
    let fpsArray = $this.getStats();
    let fpsAverage;
    let total = 0;
    if(fpsArray.length > 0){
      for(let fps in fpsArray){
        if(fpsArray[fps] == 0 || fpsArray[fps] == 1){
          fpsArray.splice(fps, 1);
        }
      }
      for(let fps in fpsArray){
        total += fpsArray[fps];
      }
      fpsAverage = Math.round(total / fpsArray.length);
    }
    return fpsAverage;
  }

  getStats(){
    let fps;
    fps = stats.getFPS();
    return fps;
  }
}

export {GLTFFpsChecker}
