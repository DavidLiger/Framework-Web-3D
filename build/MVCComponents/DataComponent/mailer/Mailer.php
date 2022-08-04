<?php
require_once "Mail.php";
//for Attachments
require_once "Mail/mime.php";
session_start();

$data = json_decode($_POST['data']);
$dataBaseOperation = $data[0];
$smtp = Mail::factory('smtp', array(
        'host' => 'smtp.gmail.com',
        'port' => '587',
        'auth' => true,
        'username' => 'david.liger.pro@gmail.com',
        'password' => 'ooigoagkaefjguub'
    ));

if($dataBaseOperation == 'sendMail'){
  $from = 'David Liger - Studio Web<david.liger.pro@gmail.com>';
  $to = '<'.filter_var($data[1], FILTER_VALIDATE_EMAIL).'>';
  $subject = filter_var($data[2], FILTER_SANITIZE_STRING);
  $body = htmlspecialchars($data[3]);
  $captcha = $data[4];
  $secret = "6Lda1r0gAAAAANcLtTA2PyYHBXoFgDT0j8jnp-kA";
  $response = json_decode(file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=".$secret."&response=".$captcha."&remoteip=".$_SERVER["REMOTE_ADDR"]), true);

  if($response["success"] != false){
    $headers = array(
        'From' => $from,
        'To' => $to,
        'Subject' => $subject
    );

    $mail = $smtp->send($to, $headers, $body);

    if (PEAR::isError($mail)) {
        echo('<p>' . $mail->getMessage() . '</p>');
    } else {
        echo('Message sent');
    }
  }else{
    echo('Invalid CAPTCHA');
  }
}

if($dataBaseOperation == 'sendConfirmationMail'){
  $from = 'David Liger - Studio Web<david.liger.pro@gmail.com>';
  $to = '<'.filter_var($data[1], FILTER_VALIDATE_EMAIL).'>';
  $subject = filter_var($data[2], FILTER_SANITIZE_STRING);
  $body = htmlspecialchars($data[3]);

  $headers = array(
      'From' => $from,
      'To' => $to,
      'Subject' => $subject
  );

  $mail = $smtp->send($to, $headers, $body);

  if (PEAR::isError($mail)) {
      echo('<p>' . $mail->getMessage() . '</p>');
  } else {
      echo('Message sent');
  }
}

if($dataBaseOperation == 'sendMailWithAttachment'){
  $mail = $data[1];
  $subject = $data[2];
  $htmlContent = $data[3];
  $file = $data[4];
  $from = 'davidliger-studio.ddns.net';
  $fromName = 'Demande de contact - David Liger - Studio Web';

  // $file = "../pdfMaker/pdf/resultats_test_".$token.".pdf";
  // $htmlContent = ' <p>'.$htmlContent.'</p>';
  $headers = "From: $fromName"." <".$from.">";
  $semi_rand = md5(time());
  $mime_boundary = "==Multipart_Boundary_x{$semi_rand}x";
  $headers .= "\nMIME-Version: 1.0\n" . "Content-Type: multipart/mixed;\n" . " boundary=\"{$mime_boundary}\"";
  $message = "--{$mime_boundary}\n" . "Content-Type: text/html; charset=\"UTF-8\"\n" .
      "Content-Transfer-Encoding: 8bit\n\n".$htmlContent."\n\n";
  //preparing attachment
  if(!empty($file) > 0){
      if(is_file($file)){
          $message .= "--{$mime_boundary}\n";
          $fp =    @fopen($file,"rb");
          $data =  @fread($fp,filesize($file));

          @fclose($fp);
          $data = chunk_split(base64_encode($data));
          $message .= "Content-Type: application/octet-stream; name=\"".basename($file)."\"\n" .
              "Content-Description: ".basename($file)."\n" .
              "Content-Disposition: attachment;\n" . " filename=\"".basename($file)."\"; size=".filesize($file).";\n" .
              "Content-Transfer-Encoding: base64\n\n" . $data . "\n\n";
      }
  }
  $message .= "--{$mime_boundary}--";
  $returnpath = "-f" . $from;

  if(mail($mail, $subject, $message, $headers, $returnpath)){
    echo 'ok';
  }else{
    echo 'nok';
  };
}
?>
