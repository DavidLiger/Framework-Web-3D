var $this;
var elements = `
      <div id="videoPlayerContainer">
        <span id='videoLoadingMsg'>Chargement...</span>
        <div id="playerContainer">
          <div id="player"></div>
        </div>
        <button id="closePlayer"><img></img></button>
        <div id="videoPlayerOpacScreen"></div>
      </div>`;
var url;
var tag;
var firstScriptTag;
var player;
var videoId;
var videoWidth = 960;
var videoHeight = 540;
var done = false;

// IMPERATIF : Ajout de <script src="https://www.youtube.com/player_api"></script> dans index.php
class VideoPlayer {

  constructor(urlToHandle) {
    $this = this
    url = urlToHandle
    $this.injectCSS()
    $this.init()
    $this.controller()
  }

  injectCSS(){
    let videoPlayerCSS = document.getElementById('videoPlayerCSS')
    if(!videoPlayerCSS){
      let cssLink = document.createElement('link');
      cssLink.setAttribute('id','videoPlayerCSS');
      cssLink.setAttribute('type','text/css');
      cssLink.setAttribute('rel','stylesheet');
      cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/VideoPlayer/VideoPlayer.css');
      document.head.appendChild(cssLink);
    }
  }

  init(){
    let videoPlayerContainer = document.getElementById('videoPlayerContainer')
    if(!videoPlayerContainer){
      document.querySelector('#container').insertAdjacentHTML('beforebegin', elements)
    }
    $('#videoLoadingMsg').show()
    $('#playerContainer').empty()
    document.querySelector('#playerContainer').insertAdjacentHTML('beforeend', '<div id="player"></div>')
    videoId = url.split('/')
    videoId = videoId[videoId.length-1]
    $this.onYouTubeIframeAPIReady(videoId)
  }

  controller(){
    $(document).on('click', '#closePlayer', function(){
      $this.closePlayer()
    })
  }

  onYouTubeIframeAPIReady(videoId){
    let width = window.innerWidth;
    let height = Math.round(width/1.777777778)
    if(width < 960){
      videoWidth = width
      videoHeight = height
    }
    player = new YT.Player('player', {
      height: videoHeight,
      width: videoWidth,
      playerVars: {
        'autoplay': 1,
        'playsinline': 1
      },
      videoId: videoId,
      events: {
        'onReady': $this.onPlayerReady
        // ,
        // 'onStateChange': $this.onPlayerStateChange
      }
    })
    $this.showVideoDisplayer()
  }

  onPlayerReady(event) {
    event.target.playVideo();
    $('#videoLoadingMsg').hide()
  }

  onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && !done) {
      setTimeout($this.stopVideo, 6000);
      done = true;
    }
  }

  stopVideo() {
    player.stopVideo();
  }

  //si souci video (403 forbidden dans mozilla) deconnexion YT ou connexion sur autre compte que davidoobidoowap
  //(même avec onglet YT fermé !)
  //ou suppression cookie YSC dans cookies YT
  showVideoDisplayer(){
    $('#videoPlayerContainer').css('visibility','visible')
  }

  closePlayer(){
    $this.stopVideo()
    $('#videoPlayerContainer').css('visibility','hidden')
    $('#playerContainer').empty()
  }
}

export { VideoPlayer }
