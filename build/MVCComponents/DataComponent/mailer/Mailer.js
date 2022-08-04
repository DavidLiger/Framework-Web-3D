var phpMailerURI = '../../../../build/MVCComponents/DataComponent/mailer/Mailer.php'

class Mailer{

  constructor(){}

  sendMail(to, subject, mailBody, captcha){
    let queryValues = ['sendMail', to, subject, mailBody, captcha];
    let data = JSON.stringify(queryValues);
    let result;
    $.get({
        type: 'POST',
        url: phpMailerURI,
        data:'data='+data,
        dataType: 'text',
        async: false,
        success: function (response){
            result = response;
        }
    });
    return result;
  }

  sendConfirmationMail(to, subject, mailBody){
    let queryValues = ['sendConfirmationMail', to, subject, mailBody];
    let data = JSON.stringify(queryValues);
    let result;
    $.get({
        type: 'POST',
        url: phpMailerURI,
        data:'data='+data,
        dataType: 'text',
        async: false,
        success: function (response){
            result = response;
        }
    });
    return result;
  }

  sendMailWithAttachment(mail, subject, message, filePath){
    let queryValues = ['sendMailWithAttachment', mail, subject, message, filePath];
    console.log(queryValues);
    let data = JSON.stringify(queryValues);
    let result;
    $.get({
        type: 'POST',
        url: phpMailerURI,
        data:'data='+data,
        dataType: 'text',
        async: false,
        success: function (response){
            result = response;
        }
    });
    return result;
  }


  isMailFormatted(email){
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
  }

}

export {Mailer}
