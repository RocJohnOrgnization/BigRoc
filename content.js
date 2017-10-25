function detectSelection() {

    var selectedTxt = window.getSelection().toString().trim();

    browser.runtime.sendMessage({
        "name": "txtSelected",
        "data": encodeURI(selectedTxt)
    });
}

function onMouseUp(evt) {

    if (evt.button == 0) {
        detectSelection();
    }
}

//document.addEventListener("select", onSelection);
//document.addEventListener("dblclick", onMouseUp);
document.addEventListener("mouseup", onMouseUp);