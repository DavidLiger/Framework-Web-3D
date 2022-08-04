var scrollPositions = [0,
                      document.body.scrollHeight/3,
                      document.body.scrollHeight];
var scrollPosition = 0;
var $this;
var gltfViewer;

class ScrollControls{

  constructor(gltfView){
    gltfViewer = Object.create(gltfView);
    $this = this;
    $this.controller();
  }

  controller(){
    $(document).on("click","#scrollNextPage", function(){
      if(scrollPosition < scrollPositions.length-1){
        scrollPosition++;
      }else{
        scrollPosition = 0;
      }
      $('html,body').animate({scrollTop: scrollPositions[scrollPosition]},"slow");
      $this.buttonsCSS();
    })
    $(document).on("click","#scrollPrevPage", function(){
      if(scrollPosition > 0){
        scrollPosition--;
      }
      $('html,body').animate({scrollTop: scrollPositions[scrollPosition]},"slow");
      $this.buttonsCSS();
    })
  }

  buttonsCSS(){
    if(scrollPosition == 0){
      $("#scrollNextPage").css('display','block').css('left','45%');
      $("#scrollPrevPage").css('display','none');
      gltfViewer.showHelp()
    }
    if(scrollPosition == scrollPositions.length-1){
      $("#scrollPrevPage").css('display','block').css('left','45%');
      $("#scrollNextPage").css('display','none');
      gltfViewer.closeHelp();
      gltfViewer.hideHelp();
    }
    if(scrollPosition != 0 && scrollPosition != scrollPositions.length-1){
      let windowWidth = $(window).width();
      if(windowWidth > 480){
        $("#scrollPrevPage").css('display','block').css('left','40%');
        $("#scrollNextPage").css('display','block').css('left','50%');
      }else{
        $("#scrollPrevPage").css('display','block').css('left','30%');
        $("#scrollNextPage").css('display','block').css('left','60%');
      }
      gltfViewer.closeHelp();
      gltfViewer.hideHelp();
    }
  }
}

export { ScrollControls };
