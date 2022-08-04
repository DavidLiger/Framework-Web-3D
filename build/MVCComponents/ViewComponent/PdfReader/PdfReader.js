var $this;
var elements = `
      <div id="pdfReaderContainer">
        <span id='loadingMsg'>Chargement...</span>
        <div id="readerContainer"></div>
        <button id="dlPdfBtn"><img></img></button>
        <button id="closeReader"><img></img></button>
        <div id="pdfReaderOpacScreen"></div>
      </div>`;
var url;
var pdfjsLib;
var pdfDoc = null;
var pageNum = 1;
var pageRendering = false;
var pageNumPending = null;
var scale = 0.8;
var canvas;
var ctx;
var btnClick = false;
var btnIsRunningFlag = false;

class PdfReader{

    //IMPERATIF dans index.php
    //<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.14.305/pdf.min.js" integrity="sha512-dw+7hmxlGiOvY3mCnzrPT5yoUwN/MRjVgYV7HGXqsiXnZeqsw1H9n9lsnnPu4kL2nx2bnrjFcuWK+P3lshekwQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    // <script src="//mozilla.github.io/pdf.js/build/pdf.js"></script>
    constructor(uriToHandle){
      $this = this
      url = uriToHandle
      $this.injectCSS()
      $this.init()
      $this.controller()
    }

    injectCSS(){
      let pdfReaderCSS = document.getElementById('pdfReaderCSS')
      if(!pdfReaderCSS){
        let cssLink = document.createElement('link');
        cssLink.setAttribute('id','pdfReaderCSS');
        cssLink.setAttribute('type','text/css');
        cssLink.setAttribute('rel','stylesheet');
        cssLink.setAttribute('href','../../../../build/MVCComponents/ViewComponent/PdfReader/PdfReader.css');
        document.head.appendChild(cssLink);
      }
    }

    init(){
      let pdfReaderContainer = document.getElementById('pdfReaderContainer')
      if(!pdfReaderContainer){
        document.querySelector('#container').insertAdjacentHTML('beforebegin', elements)
      }
      $('#readerContainer').empty()
      document
      .querySelector('#readerContainer')
      .insertAdjacentHTML(
        'beforeend',
        `<div>
          <button id="pdfReaderPrev">Prev</button>
          <span id="pageCounter">Page: <span id="page_num"></span> / <span id="page_count"></span></span>
          <button id="pdfReaderNext">Next</button>
        </div>
        <canvas id="pdfReaderCanvas"></canvas>`
      )
      $this.initPdfReader()
      $this.showReader()
    }

    initPdfReader(){
      pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
      canvas = document.getElementById('pdfReaderCanvas'),
      ctx = canvas.getContext('2d')
      pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page_count').textContent = pdfDoc.numPages;
        if(pdfDoc.numPages > 1){
          $this.showPdfControls()
        }
        // Initial/first page rendering
        $this.renderPage(pageNum);
      });
    }

    controller(){
      $(document).on('click','#pdfReaderPrev',function(){
        btnClick = true;
        if(btnClick && !btnIsRunningFlag){
          btnIsRunningFlag = true;
          $this.onPrevPage()
          $('#pdfReaderPrev').prop('disabled', true);
          $('#pdfReaderPrev').css('opacity', '0.5');
        }
        setTimeout(function(){
          btnClick = false;
          btnIsRunningFlag = false
          $('#pdfReaderPrev').prop('disabled', false);
          $('#pdfReaderPrev').css('opacity', '1');
        },500)
      })
      $(document).on('click','#pdfReaderNext',function(){
        btnClick = true;
        if(btnClick && !btnIsRunningFlag){
          btnIsRunningFlag = true;
          $this.onNextPage()
          $('#pdfReaderNext').prop('disabled', true);
          $('#pdfReaderNext').css('opacity', '0.5');
        }
        setTimeout(function(){
          btnClick = false;
          btnIsRunningFlag = false
          $('#pdfReaderNext').prop('disabled', false);
          $('#pdfReaderNext').css('opacity', '1');
        },500)
      })
      $(document).on('click', '#closeReader', function(){
        pageNum = 1
        $this.closeReader()
      })
      $(document).on('click', '#dlPdfBtn', function(){
        $this.downloadPdf()
      })
    }

    renderPage(num) {
    pageRendering = true;
    // Using promise to fetch the page
    pdfDoc.getPage(num).then(function(page) {
      var viewport = page.getViewport({scale: scale});
      let width = window.innerWidth;
      let screenWidth;
      if(width < 670 && width > 450){
        screenWidth = Math.round(width-(width/4))
      }else if(width < 450){
        screenWidth = Math.round(width-(width/10))
      }else{
        screenWidth = viewport.width
      }
      var viewport = page.getViewport({scale: screenWidth / page.getViewport({scale: 1}).width});
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      // Render PDF page into canvas context
      var renderContext = {
        canvasContext: ctx,
        viewport: viewport
      };
      var renderTask = page.render(renderContext);

      // Wait for rendering to finish
      renderTask.promise.then(function() {
        $('#loadingMsg').hide()
        pageRendering = false;
        if (pageNumPending !== null) {
          // New page rendering is pending
          $this.renderPage(pageNumPending);
          pageNumPending = null;
        }
      });
    });
    // Update page counters
    document.getElementById('page_num').textContent = num;
  }

  queueRenderPage(num) {
    if (pageRendering) {
      pageNumPending = num;
    } else {
      $this.renderPage(num);
    }
  }

  onPrevPage() {
    if (pageNum <= 1) {
      return;
    }
    pageNum--;
    $this.queueRenderPage(pageNum);
  }

  onNextPage() {
    if (pageNum >= pdfDoc.numPages) {
      return;
    }
    pageNum++;
    $this.queueRenderPage(pageNum);
  }

  showPdfControls(){
    $('#readerContainer div').css('visibility','visible')
  }

  downloadPdf(){
    let fileName = url.split('/')
    fileName = fileName[fileName.length-1]
    fileName = fileName.split('.')[0]
    let link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;
    link.dispatchEvent(new MouseEvent('click'));
  }

  showReader(){
    $('#pdfReaderContainer').css('visibility','visible')
    $('#loadingMsg').show()
  }

  closeReader(){
    $('#pdfReaderContainer').css('visibility','hidden')
    $('#readerContainer').empty()
  }
}

export { PdfReader }
