function getQueryStrings() {
    var assoc = {};
    var decode = function(s) { return decodeURI(s.replace(/\+/g, " ")); };
    var queryString = location.search.substring(1);
    var keyValues = queryString.split('&');

    for (var i in keyValues) {
        var key = keyValues[i].split('=');
        if (key.length > 1) {
            assoc[decode(key[0])] = decode(key[1]);
        }
    }

    return assoc;
}

function updateUrl(url) {
    var frm = document.getElementById("idBingFrame");
    if (frm) {
        frm.src = url;
    }
}

function transLoad() {
    var qss = getQueryStrings();

    var bigroc = atob(qss["bigroc"]);
    updateUrl(bigroc);

}

function msgReceived(msg) {
    if (msg.name == "urlUpdated") {
        updateUrl(msg.data);
    }
}

transLoad();
browser.runtime.onMessage.addListener(msgReceived);