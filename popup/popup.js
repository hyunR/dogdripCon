// TODO: 새로고침해도 스크롤바 유지해줭
// 했엉
function setup() {

  noCanvas();
  let userinputHeight = select('#userinputHeight');
  let userinputWidth = select('#userinputWidth');
  let button = select('#maxButton');
  let runButton = select('#run');
  let fillButton = select('#fillComment');
  let resetButton = select('#reset');
  let autoSubmitButton = select('#autoSubmit');
  let toImgStorageButton = select('#urlImgStorage')
  var sleepMs = 10;


  button.mousePressed(changText);
  runButton.mousePressed(sendRunMessage);
  // fillButton.mousePressed(sendFillMessage);
  // resetButton.mousePressed(resetImgArray);
  autoSubmitButton.mousePressed(setAutoSubmit);
  toImgStorageButton.mousePressed(addNewTabToStorage);

  autoSubmitSwith(true);
  runningStatus();

  chrome.storage.sync.get('imgArray', async function(result){
    var imgNumField = document.getElementsByClassName('submitNumber');
    var imgField = document.getElementsByClassName('imgField');

    if(typeof result.imgArray == 'undefined'){
      chrome.storage.sync.set({'imgArray' : []});
      await sleep(100);
    }

    if(typeof result.imgArray != 'undefined') {
      imgNumField[0].textContent = result.imgArray.length;
    }

    for (elt in result.imgArray) {

      var imgContainer = document.createElement('div');
      var newElement = document.createElement('img');
      var deleteBtn = document.createElement('img')

      imgContainer.className = "imgContainer";
      newElement.className = "popupImg";
      deleteBtn.className = "popUpDeleteBtn";

      deleteBtn.src = "/delete.png";
      newElement.src = result.imgArray[elt];

      imgContainer.draggable = "true";

      imgContainer.addEventListener('dragstart', handleDragStart, false);
      imgContainer.addEventListener('dragenter', handleDragEnter, false);
      imgContainer.addEventListener('dragover', handleDragOver, false);
      imgContainer.addEventListener('dragleave', handleDragLeave, false);
      imgContainer.addEventListener('drop', handleDrop, false);
      imgContainer.addEventListener('dragend', handleDragEnd, false);


      newElement.onclick = function(){
        sendFillMessage(this.src)
      }

      var imgField = document.getElementById("imgField");

      // deleteBtn.setAttribute("data-imgSrc", newElement.src);

      deleteBtn.onclick = function(){
        deleteImg(this.nextSibling.src);
      }
      imgContainer.appendChild(deleteBtn);
      imgContainer.appendChild(newElement);

      imgField.appendChild(imgContainer);
    }
  });
  //  **************************************************************************
  var dragSrcEl = null;
  // When drag starts, do this
  function handleDragStart(e) {

    dragSrcEl = this;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
  }

  function handleDragEnter(e) {
    // this / e.target is the current hover target.


    this.classList.add('over');
  }

  function handleDragLeave(e) {


    this.classList.remove('over');  // this / e.target is previous target element.
  }

  function handleDrop(e) {
  // this/e.target is current target element.

  if (e.stopPropagation) {
      e.stopPropagation(); // Stops some browsers from redirecting.
    }

    // Don't do anything if dropping the same column we're dragging.
    if (dragSrcEl != this) {
      // Set the source column's HTML to the HTML of the column we dropped on.
      dragSrcEl.innerHTML = this.innerHTML;
      this.innerHTML = e.dataTransfer.getData('text/html');
      setOnClick(this);
      setOnClick(dragSrcEl);
      updateImgArrayAfterDnD()
    }

    return false;
  }

  function handleDragEnd(e) {
    // this/e.target is the source node.
    this.classList.remove('over');
  }

  function setOnClick(droppedImg) {

    var droppedDeleteBtn = droppedImg.getElementsByClassName("popUpDeleteBtn");
    var droppedImg = droppedImg.getElementsByClassName("popupImg");

    droppedDeleteBtn[0].onclick = function(){
      deleteImg(droppedImg.src);
    }

    droppedImg[0].onclick = function(){
      sendFillMessage(this.src)
    }
  }

  function updateImgArrayAfterDnD() {
    var imgFiledDnD = document.getElementById("imgField");
    var popupImgsDnD = imgFiledDnD.getElementsByClassName("popupImg");
    var newImgArray = []
    for (var i = 0; i < popupImgsDnD.length; i++) {
      newImgArray.push(popupImgsDnD[i].src);
    }
    chrome.storage.sync.set({"imgArray" : newImgArray});
    saveScollPos();
    window.location.reload(false);
  }



  //  **************************************************************************

  function deleteImg(imgSrcToDelet) {

    chrome.storage.sync.get('imgArray', function(result){
        let index = result.imgArray.indexOf(imgSrcToDelet);
        result.imgArray.splice(index, 1);
        chrome.storage.sync.set({"imgArray" : result.imgArray});
        // var scrollBarPos = document.getElementById("imgField").scrollTop;
        // localStorage.setItem('scrollBarPos', scrollBarPos);
        saveScollPos();
        window.location.reload(false);
        // reloadImgField();

    });

}

  function saveScollPos() {
    var scrollBarPos = document.getElementById("imgField").scrollTop;
    localStorage.setItem('scrollBarPos', scrollBarPos);
  }

  var imgFieldScrollbar = document.getElementById("imgField");
  imgFieldScrollbar.onload = restoreScrollbar();

  async function restoreScrollbar() {

    var imgFieldScrollbar = document.getElementById("imgField");

    var scrollBarPos = localStorage.getItem('scrollBarPos');
    await sleep(sleepMs);

    imgFieldScrollbar.scrollTop += scrollBarPos;
  };

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  var params = {
    active : true,
    currentWindow : true
  };


  function resetImgArray() {
    chrome.storage.sync.set({"imgArray" : []});
  }


  function sendFillMessage(clickedImgSrc) {

    chrome.tabs.query(params, gotRuns);

    function gotRuns(tabs) {
      var msg = {
        txt : "fill",
        imgSrc : clickedImgSrc
      }

      chrome.tabs.sendMessage(tabs[0].id, msg);
    }
  }


async function sendRunMessage() {

    chrome.tabs.query(params, gotRuns);

    function gotRuns(tabs) {
      let msg = {
        txt : "run"
      }
      chrome.tabs.sendMessage(tabs[0].id, msg);
    }
    await sleep(100);
    runningStatus();
  }

  function changText() {

    chrome.tabs.query(params, gotTab);

    function gotTab(tabs) {

      let msg = {
        txt : "popup",
        maxHeight : userinputHeight.value(),
        maxWidth : userinputWidth.value()
      }
      chrome.tabs.sendMessage(tabs[0].id, msg);
    }
  }

  function setAutoSubmit() {

    chrome.tabs.query(params, gotTab);

    function gotTab(tabs) {

      let msg = {
        txt : "autoSubmit"
      }
      chrome.tabs.sendMessage(tabs[0].id, msg);
    }
    autoSubmitSwith(false);

  }

   function autoSubmitSwith(legit) {
     if (legit) {
       chrome.storage.sync.get('autoSubmit', function(result) {
        if(result.autoSubmit){
          document.getElementById("autoSubmit").innerText = "자동 등록"
        }
        else{
          document.getElementById("autoSubmit").innerText = "수동 등록"
        };
      });
     } else {
       chrome.storage.sync.get('autoSubmit', function(result) {
        if(!result.autoSubmit){
          document.getElementById("autoSubmit").innerText = "자동 등록"
        }
        else{
          document.getElementById("autoSubmit").innerText = "수동 등록"
        };
      });
     }
  };

  function runningStatus() {
    chrome.storage.sync.get('autoRun', function(result){

      if(result.autoRun){
        document.getElementById("run").innerText = "작동 중"
      }
      else {
        document.getElementById("run").innerText = "쉬는 중"
      }
    })
  }

  function addNewTabToStorage() {

    chrome.tabs.query(params, gotTab);

    function gotTab(tabs) {

      let msg = {
        txt : "addNewTabToStorage"
      }
      chrome.tabs.sendMessage(tabs[0].id, msg);
    }

  }

}
