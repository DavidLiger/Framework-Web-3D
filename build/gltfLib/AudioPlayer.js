var playerDOM =
`<div id="audioPlayer">
</div>
<div id="audioControls">
  <div id="timer">00:00/00:00</div>
  <button id="prevTrack"><i id="prevTrackIcon" class="fas fa-backward"></i></button>
  <button id="playMusic"><i id="playMusicIcon" class="far fa-play-circle"></i></button>
  <button id="nextTrack"><i id="nextTrackIcon" class="fas fa-forward"></i></button>
  <button id="replayTrack"><i id="replayTrackIcon" class="fas fa-redo"></i></button>
</div>`;
var playList;
var isPlaying = false;
var isOpen = false;
var currTrack = 0;
var audio;
var $this;
var dataJSON;
var gltfAnimator;
var container;
var playerElements = ['prevTrack','prevTrackIcon','playMusic','playMusicIcon',
                      'nextTrack','nextTrackIcon','replayTrack','replayTrackIcon',
                      'audioControls','scrollText','audioPlayer','radioBtnImg',
                      'radio']

class AudioPlayer {
  constructor(dataJSONToHandle) {
    $this = this;
    dataJSON = dataJSONToHandle;
    container = dataJSON.audioPlayer.container;
    playList = dataJSON.audioPlayer.playList;
    $this.controller();
    $this.closeByclickOutside();
  }

  setGLTFAnimator(gltfAnimat){
    gltfAnimator = gltfAnimat;
  }

  injectInDOM(){
    document.getElementById(container).innerHTML = playerDOM;
    if(dataJSON.audioPlayer.displayerStyle.scrollText){
      document.getElementById('audioPlayer').innerHTML = '<span id="scrollText"><span>';
    }
    if(dataJSON.audioPlayer.displayerStyle.playList){
      document.getElementById('audioPlayer').innerHTML = '<span id="playList"><span>';
    }
    $this.loadTrack();
  }

  controller(){
      $(document).on("click","#playMusic", function(){
        $this.playpauseTrack();
      })
      $(document).on("click","#nextTrack", function(){
        $this.nextTrack();
      })
      $(document).on("click","#prevTrack", function(){
        $this.previousTrack();
      })
      $(document).on("click","#radioBtnImg", function(){
        $this.openCloseRadio();
      })
      $(document).on("click","#replayTrack", function(){
        $this.setLoop();
      })
      $(document).on("click","#playList span",function(){
        currTrack = $(this).attr('id')
        $this.targetTrack();
      })
  }

  showRadio(){
    $("#radio").css('display','block');
  }

  openCloseRadio(){
    if(isOpen == false){
      $("#radio").animate({width: '+=250px'}, 400);
      $("#radioBtnImg").animate({right: '+=250'}, 400);
      $("#audioPlayer").css("visibility","visible").fadeIn(1000);
      $("#audioControls").css("visibility","visible").fadeIn(1000);
      isOpen = true;
    }else{
      $("#radio").animate({width: '-=250px'}, 400);
      $("#radioBtnImg").animate({right: '-=250'}, 400);
      $("#audioPlayer").css("visibility","visible").fadeOut(120);
      $("#audioControls").css("visibility","visible").fadeOut(120);
      isOpen = false;
    }
  }

  closeRadio(){
    $("#radio").animate({width: '-=250px'}, 400);
    $("#radioBtnImg").animate({right: '-=250'}, 400);
    $("#audioPlayer").css("visibility","visible").fadeOut(120);
    $("#audioControls").css("visibility","visible").fadeOut(120);
    isOpen = false;
  }

  isOpened(){
    return isOpen;
  }

  loadTrack(){
    audio = new Audio(playList[currTrack].track);
    $this.displayCurrentTrack();
  }

  displayCurrentTrack(){
    if(dataJSON.audioPlayer.displayerStyle.scrollText){
      let trackNumber = currTrack+1;
      let text = trackNumber+' - '+playList[currTrack].name;
      let scrollText = document.querySelector("#scrollText");
      if(scrollText != null){
        scrollText.innerHTML = text
      }
    }
    if(dataJSON.audioPlayer.displayerStyle.playList){
      var domPlayList = document.querySelector("#playList");
      if(domPlayList.childNodes.length == 1){
        playList.forEach((track, i) => {
          let domElementTrack = '<span id='+i+'>'+(+i+1)+' - '+track.name+'</span>'
          domPlayList.insertAdjacentHTML('beforeend', domElementTrack)
        });
      }
    }
  }

   playpauseTrack() {
    if (!isPlaying)
      $this.playTrack();
    else
      $this.pauseTrack();
  }

  playTrack() {
    audio.play();
    $this.displayRemainingTime();
    isPlaying = true;
    $("#radioBtnImg").css('animation','glowing 1300ms infinite');
    $("#playMusic").html('<i id="playMusicIcon" class="far fa-pause-circle"></i>');
    $this.playLoop();
    if(gltfAnimator != null){
      gltfAnimator.playAnimation(dataJSON.audioPlayer.playAnim)
    }
    if(dataJSON.audioPlayer.displayerStyle.playList){
      $this.boldCurrentTrack()
    }
  }

  pauseTrack() {
    audio.pause();
    isPlaying = false;
    $("#radioBtnImg").css('animation','');
    $("#playMusic").html('<i id="playMusicIcon" class="far fa-play-circle"></i>')
  }

  nextTrack(){
    audio.pause();
    isPlaying = false;
    if(currTrack < playList.length-1){
      currTrack++;
    }else{
      currTrack = 0;
    }
    $this.loadTrack()
    $this.playTrack()
    $this.setDisplayer('audioPlayer')
    audio.loop = false;
    $("#replayTrack").css('animation','');
  }

  previousTrack(){
    audio.pause();
    isPlaying = false;
    if(currTrack > 0){
      currTrack--;
    }else{
      currTrack = playList.length-1;
    }
    $this.loadTrack()
    $this.playTrack()
    $this.setDisplayer('audioPlayer')
    audio.loop = false;
    $("#replayTrack").css('animation','');
  }

  targetTrack(){
    audio.pause();
    isPlaying = false;
    $this.loadTrack()
    $this.playTrack()
    $this.setDisplayer('audioPlayer')
    audio.loop = false;
    $("#replayTrack").css('animation','');
  }

  boldCurrentTrack(){
    document.querySelector("#playList").childNodes.forEach((track) => {
      let id = track.getAttribute('id');
      if(currTrack == id){
        $(track).css('font-weight','bolder');
        $(track).css('font-size','1.3em')
      }else{
        $(track).css('font-weight','normal')
        $(track).css('font-size','1.2em')
      }
    });
  }

  setLoop(){
    if(audio.loop == false){
      audio.loop = true;
      $("#replayTrack").css('animation','blueGlowing 1300ms infinite');
    }else{
      audio.loop = false;
      $("#replayTrack").css('animation','');
    }
  }
  //
  playLoop(){
    if(audio.loop == false){
      audio.onended = function() {
        $this.nextTrack();
      }
    }
  }

  setDisplayer(displayer){
    let marginFix = 117;
    let marginRight = marginFix-Math.round($("#"+displayer+"").width()/2);
    $("#"+displayer+"").css('right',marginRight*2);
  }

  closeByclickOutside(){
      var flag = "1";
      for(let element in playerElements){
        $('#'+playerElements[element]+'').click(function(event){
          flag = "0";
        });
      }

      $('html').click(function() {
        if(flag != "0"){
          if(isOpen){
            $this.closeRadio()
          }
        }
        else {
            flag = "1";
        }
      });
  }

  displayRemainingTime(){
    audio.addEventListener('timeupdate', (event) => {
      let currTime = Math.floor(audio.currentTime);
      let duration = Math.floor(audio.duration);
      if (isNaN(duration)){
        duration = 0
      }
      $("#timer").html($this.formatSecondsAsTime(currTime)+'/'+$this.formatSecondsAsTime(duration))
      $this.setDisplayer('timer')
    }, false);
  }


  formatSecondsAsTime(secs, format) {
    let hr  = Math.floor(secs / 3600);
    let min = Math.floor((secs - (hr * 3600))/60);
    let sec = Math.floor(secs - (hr * 3600) -  (min * 60));

    if (min < 10){
      min = "0" + min;
    }
    if (sec < 10){
      sec  = "0" + sec;
    }

    return min + ':' + sec;
  }

  isActuallyPlaying(){
    return isPlaying
  }

}


export { AudioPlayer };
