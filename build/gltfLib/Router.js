import { ContextDetector } from '../lib/ContextDetector.js';

var $this;
var modal;

class Router {

  constructor() {
    $this = this;
    // modal = new Modal(new ContextDetector())
  }

  routeTo(objLink){
    if(typeof objLink == 'object'){
      Object.entries(objLink).forEach(([key, value]) => {
        if(key == 'modal'){
          modal.setModal(value);
          modal.setModalOpen(true);
        }
        if(key == 'modalAfter'){
          value.forEach((val) => {
            Object.entries(val).forEach(([valKey, valValue]) => {
              if(valKey == 'modal'){
                modal.setModal(valValue);
                modal.setModalOpen(true);
              }
            });
          });
        }
        if(key == 'url'){
          if(key.newTab){
            window.open(key.link, '_blank')
          }else{
            window.location.assign(key.link)
          }
        }
      });
    }
  }

  setModal(modalToHandle){
    modal = modalToHandle
  }

  getModal(){
    return modal
  }

}

export {Router}
