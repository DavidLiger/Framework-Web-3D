import {Mailer} from '../../../../build/MVCComponents/DataComponent/mailer/Mailer.js';
import {ClipboarderCopier} from '../../../../build/MVCComponents/ViewComponent/ClipboardCopier/ClipboardCopier.js';

var $this;
var mailer;
var modal;
var mailAdress;
var captcha;
var captchaCodeURI = '../../../../build/MVCComponents/ViewComponent/ContactForm/captcha.php';
var contactFormElements = `
      <div id="clipboardCopierContainer"></div>
      <div id="formContainer">
        <input type="text" id="nameInput"  placeholder='Votre nom'>
        <p id="warningName" class="warning"></p>
        <input type="text" id="mailInput"  placeholder='Votre adresse mail'>
        <p id="warningMail" class="warning"></p>
        <textarea id="messageInput" style='margin-top: 5px;margin-bottom: 5px' placeholder='Votre message'></textarea>
        <p id="warningMessage" class="warning"></p>
        <div id="sendContainer">
          <div id="captchaContainer">
            <div id="grecaptchaContainer"></div>
            <p id="warningCaptcha" class="warning" style="width: 300px;margin-bottom: 8px;"></p>
          </div>
          <div id="sendMessageBtnContainer">
            <button id="sendMessageBtn">Envoyer</button>
          </div>
        </div>
      </div>`;
var confirmationMessage = `Merci pour votre message ! \nJe reviens vers vous, très vite. \nA bientôt !`

class ContactForm {
  constructor(containerId, modalToHandle) {
    $this = this;
    modal = modalToHandle;
    mailer = new Mailer();
    $this.inject(containerId, contactFormElements, 'beforeend');
    new ClipboarderCopier('clipboardCopierContainer','david.liger.pro@gmail.com')
    $this.init()
  }

  inject(target, elements, position){
    document.querySelector(target).insertAdjacentHTML(position, elements)
  }

  init(){
    let contactFormCSS = document.getElementById('contactFormCSS')
    if(!contactFormCSS){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','contactFormCSS');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/ContactForm/ContactForm.css');
      document.head.appendChild(cssLink);
    }
    document.getElementById('formContainer').scrollTop = 0;
    $this.loadGRecaptcha();
    $this.controller()
  }

  loadGRecaptcha(){
    if(typeof grecaptcha === 'undefined') {
    grecaptcha = {};
    }
    grecaptcha.ready = function(cb){
      if(typeof grecaptcha === 'undefined') {
        const c = '___grecaptcha_cfg';
        window[c] = window[c] || {};
        (window[c]['fns'] = window[c]['fns']||[]).push(cb);
      } else {
        cb();
      }
    }
    grecaptcha.ready(function(){
      grecaptcha.render("grecaptchaContainer", {
        sitekey: "6Lda1r0gAAAAADCgW1Hltw9jGNGr8f3jV2C5B7eo"
      });
    });
  }

  controller(){
    $(document).on("click","#sendMessageBtn", function(){
      if($this.checkFormAndSendMail() == 'Message sent'){
        modal.setModal('msgSentNotif');
        $("#articleResponse").css('color','green');
        $("#articleResponse").text('Message reçu ! Je reviens vers vous rapidement !');
        $this.sendConfirmationMail();
        setTimeout(()=>{
          modal.hideModal()
        },2500)
      }
      if($this.checkFormAndSendMail() == 'Invalid CAPTCHA'){
        $("#warningCaptcha").text('CAPTCHA invalide');
        $("#captcha").css("border-color","red");
      }
    })
    $(document).on("click",".refresh-captcha", function(){
      $("#captcha").css("border-color","lightgrey");
      $("#warningCaptcha").text('');
      $("#captcha").val('');
      document.querySelector(".captcha-image").src = ''+captchaCodeURI+'?' + Date.now();
    })
  }

  checkFormAndSendMail(){
    let name = $("#nameInput").val();
    mailAdress = $("#mailInput").val();
    let message = $("#messageInput").val();
    captcha = grecaptcha.getResponse();
    let inputsChecked = {'name':'nok','mail':'nok','message':'nok','captcha':'nok'};
    let readyToSend = true;
    $("#nameInput").css("border-color","lightgrey");
    $("#mailInput").css("border-color","lightgrey");
    $("#messageInput").css("border-color","lightgrey");
    $("#captcha").css("border-color","lightgrey");
    $("#warningName").text('');
    $("#warningMail").text('');
    $("#warningMessage").text('');
    $("#warningCaptcha").text('');
    if(name != null && name != "" && name != "undefined"){
      inputsChecked.name = 'ok'
    }else{
      $("#warningName").text('Merci de remplir la case \'Nom\'');
      $("#nameInput").css("border-color","red");
    }
    if(mailer.isMailFormatted(mailAdress)){
      inputsChecked.mail = 'ok'
    }else{
      $("#warningMail").text('Merci de remplir la case \'Adresse Mail\' avec une adresse au bon format');
      $("#mailInput").css("border-color","red");
    }
    if(message != null && message != "" && message != "undefined"){
      inputsChecked.message = 'ok'
    }else{
      $("#warningMessage").text('Merci de remplir la case \'Message\'');
      $("#messageInput").css("border-color","red");
    }
    if(captcha != null && captcha != "" && captcha != "undefined"){
      inputsChecked.captcha = 'ok'
    }else{
      $("#warningCaptcha").text('Merci de compléter le CAPTCHA');
      $("#captcha").css("border-color","red");
    }
    Object.entries(inputsChecked).forEach(([key, value]) => {
      if(value != 'ok'){
        readyToSend = false
      }
    });
    if(readyToSend){
      let to = 'david.liger.pro@gmail.com';
      let subject = 'Contact depuis folio';
      let mailBody = "Entreprise : "+name+"\nAdresse Mail : "+mailAdress+"\nMessage : \n"+message;
      return mailer.sendMail(to, subject, mailBody, captcha);
    }
  }

  sendConfirmationMail(){
    if(mailer.isMailFormatted(mailAdress)){
      mailer.sendConfirmationMail(mailAdress,
        'Confirmation message reçu / David Liger - Web Developper',
        confirmationMessage)
    }
  }

  getContactFormElements(){
    return contactFormElements;
  }
}

export {ContactForm}
