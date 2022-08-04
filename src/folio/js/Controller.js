import { View } from '/src/studio/js/View.js';
import { Model } from '/src/studio/js/Model.js';

var $this;

$(document).ready(function () {
  new View();
  new Model();
  controller()
});

function controller(){
  $(document).on('click','#portfolio_1',function(){
    console.log('ok');
    window.location.assign('../src/examples/portfolio/_1/index.php')
  })
}
