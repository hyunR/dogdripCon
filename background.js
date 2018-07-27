chrome.browserAction.onClicked.addListener(buttonClicked);

function buttonClicked(tab) {
  let msg = {
    txt : "hello"
  }
  chrome.tabs.sendMessage(tab.id, msg);
}

function addSelectedImageToFavorite(word, tab) {
  if (word.selectionText == undefined) {
    var selectUrl = word.linkUrl;
  } else {
    var selectUrl = word.selectionText;
  }
  sendImageSrc(tab, selectUrl)
}

function imageSelected(info, tab) {
    sendImageSrc(tab, info.srcUrl);
}

function sendImageSrc(tab, imgSrc) {
  var msg = {
    txt : "rightClicked",
    context : imgSrc
  }
  chrome.tabs.sendMessage(tab.id, msg);
}

chrome.contextMenus.create({
  title : "개드립 콘에 추가하기",
  contexts : ["selection",  "link"],
  onclick : addSelectedImageToFavorite
});
chrome.contextMenus.create({
  title : "개드립 콘에 추가하기",
  type : "normal",
  contexts : ["image"],
  onclick : imageSelected
});
