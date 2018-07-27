var urlRegex = RegExp(/(http:\/\/dcimg.*\d+)|((?:(?:https?|ftp):\/\/)?[\w/\-?=%.]+\.(jpg|png|gif|jpeg|svg|bmp)+)/, 'g', 'i');

var maxHeight = localStorage.getItem('maxHeight');
var maxWidth = localStorage.getItem('maxWidth');

var autoSubmit = chrome.storage.sync.get('autoSubmit', function(result) {
  if(result.autoSubmit == undefined){
    chrome.storage.sync.set({"autoSubmit" : false});
  }
  autoSubmit = result.autoSubmit;
});

var autoRun = chrome.storage.sync.get('autoRun', function(result) {
  if(result.autoRun == undefined){
    chrome.storage.sync.set({"autoRun" : false});
  }
  autoRun = result.autoRun;
});

// var imgArray = JSON.parse(localStorage.getItem('imgArray'));
var imgArray = []
  //chrome.storage.sync.set({"imgArray" : [] });

var imgArray = chrome.storage.sync.get('imgArray', function(result) {
          if(result.imgArray == undefined){
            chrome.storage.sync.set({"imgArray" : imgArray});
          }
          imgArray = result.imgArray;
        });


chrome.storage.sync.get('autoRun', function(result) {
  if (result.autoRun){
    addImageToComments();
  }

});

if( maxHeight == null) {
  maxHeight = '500px';
}

if( maxWidth == null) {
  maxWidth = '500px';
}

chrome.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {

  if(message.txt === "run"){
    setAutoRun();
  }
  if(message.txt == "popup"){
    setMaxFromPopup(message)
  }
  if(message.txt == "rightClicked"){
    saveToLocalStorage(message.context);
  }
  if(message.txt == "fill"){
    fillComment(message.imgSrc);
  }
  if(message.txt == 'autoSubmit'){
    setAutoSubmit();
  }
  if(message.txt == "addNewTabToStorage"){
    openImgStorage();
  }
}

function addImageToComments() {
  let comments = document.getElementsByClassName('comment xe_content') // grab the comment div

  for (elt of comments) {

    var comment = elt.textContent; // grab the text content
    var imgLinks = grabImgRegex(comment);

    if(isValidArray(imgLinks)){ // if there is any img link

      elt.textContent = elt.textContent.replace(urlRegex, "") // "delete" the link for better looking

      for(imgLink of imgLinks){ // iterate thru img array and add all the images

        addLine(elt);

        var elem = document.createElement("img");

        elem.src = imgLink;
        imgSize(elem, "Auto", "Auto", maxHeight, maxWidth);
        elem.setAttribute("alt", "comment");

        elt.appendChild(elem);

      }
    }
  }


}

// set imgs size and max property
function imgSize(img, height, width, maxHeight, maxWidth) {
    img.setAttribute("height", height);
    img.setAttribute("width", width);
    img.style.maxHeight = maxHeight;
    img.style.maxWidth = maxWidth;
    img.setAttribute("alt", "comment");
}

// grab any image links in the comment and this is an array with matched string at index 0
function grabImgRegex(link) {
    return link.match(urlRegex);
}

function isValidArray(array) {
  return array !== null && array !== 'undefined' && array.length > 0;
}

function addLine(elemnt) {
  var newLine = document.createElement("br");
  elemnt.appendChild(newLine);
}

function setMaxFromPopup(message) {
  maxHeight = message.maxHeight + 'px';
  localStorage.setItem('maxHeight', maxHeight);
  maxWidth = message.maxWidth + 'px';
  localStorage.setItem('maxWidth', maxWidth);
  document.location.reload(true);

}

// add img link to comment field
 function fillComment(receivedImgSrc) {
  var content = receivedImgSrc + "\n";
  // var commentField = document.getElementById('editor_1');
  // var submitBtn = document.getElementById('submitComment').firstElementChild;
  // var contentField =  document.getElementsByClassName('xe_content editable').item(0);

  var textArea = document.getElementsByTagName("textarea");
  var htmlButton = document.getElementsByClassName("xpress_xeditor_mode_toggle_button");
  if(htmlButton.length == 1){
    addImgToPost(receivedImgSrc);
    return

  }else if(textArea.length == 1){
    var commentField = textArea[0];
    var submitBtn = document.getElementById('submitComment').firstElementChild;
  } else {
    var commentField = textArea[0];
    var submitBtn = document.getElementsByClassName("commentButton tRight")[0].firstElementChild.firstElementChild;
  }

  commentField.value = commentField.value + content;
  if(autoSubmit){
      submitBtn.click();
  }

}


function saveToLocalStorage(content) {
  // Add img to favorite iff there is no duplicate
  if (!imgArray.includes(content)) {

    imgArray.push(content);

    chrome.storage.sync.set({"imgArray" : imgArray});

    chrome.storage.sync.get('imgArray', function(result){

      });
  } else {
    console.log("추가하신 이미지가 중복되었어요.\nAlert 하면 짜증날거 같아서 로그에 써봤어요.");
  }
}

function setAutoSubmit() {
  chrome.storage.sync.set({"autoSubmit" : !autoSubmit});
  autoSubmit = !autoSubmit;
}

function setAutoRun() {
  chrome.storage.sync.set({"autoRun" : !autoRun});
  autoRun = !autoRun;
}

function openImgStorage() {
  var win = window.open("http://www.dogdrip.net/imagestorage", '_blank');
  win.focus();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addImgToPost(receivedImgSrc) {
  var htmlButton = document.getElementsByClassName("xpress_xeditor_mode_toggle_button")[0];

  htmlButton.click();

  var textArea = document.getElementsByTagName("textarea")[1];

  var newElement = document.createElement('img');

  newElement.src = receivedImgSrc;
  newElement.setAttribute("width", "Auto");
  newElement.setAttribute("height", "Auto");
  textArea.value += newElement.outerHTML;

  htmlButton.click();
}
