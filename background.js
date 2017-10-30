var gStatus = "off";
var gShowWinOrTab = true;
var gNormalWinOrPopup = false;
var gTimer = null;
var gSelectedTxt = null;
var gTransWinId = 0;
var gTransTabId = 0;

var gUrlPattern = "*://*.bing.com/dict/*";

var gDefaultUserAgent = "Mozilla/5.0 (Linux; Android 4.1.1; Galaxy Nexus Build/JRO03C) AppleWebKit/535.19 (KHTML, like Gecko) Chrome/18.0.1025.166 Mobile Safari/535.19";
var gIosUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 9_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/47.0.2526.70 Mobile/13C71 Safari/601.1.46";
var gAndroidUserAgent = "Mozilla/5.0 (Linux; U; Android 4.4.4; Nexus 5 Build/KTU84P) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30";
var gWinPhoneUserAgent = "Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0)";

//var gTranslatorUrl = "https://cn.bing.com/dict/search?q=";
var gTranslatorUrl = "https://www.bing.com/dict/search?intlF=0&q=";

function showNotification(title, content) {
    browser.notifications.create({
        "type": "basic",
        "iconUrl": browser.extension.getURL("icons/bigroc_on.png"),
        "title": title,
        "message": content
    })
}

function toggleButton() {
    var msg;
    var msgOn = "BigRoc On !!!";
    var msgOff = "BigRoc Off !!!";

    if (gStatus == "off") {
        gStatus = "on";
        msg = msgOn;
        browser.browserAction.setIcon({ "path": "icons/bigroc_on.png" });
    } else {
        gStatus = "off";
        msg = msgOff;
        browser.browserAction.setIcon({ "path": "icons/bigroc_off.png" });
    }

    showNotification("Notification!", msg);
}

function getTransTabId(transWinId) {
    var queryData = {
        "windowId": transWinId,
    }
    var tabsgot = browser.tabs.query(queryData);
    tabsgot.then((tabs) => {
            gTransTabId = tabs[0].id;
        },
        (err) => {
            showNotification("Getting Tabs:", "!" + err);
        });
}

function createTranslator(bingUrl) {
    var transUrl = "translator.html?bigroc=" + btoa(bingUrl);
    var creating = null;

    if (gShowWinOrTab) {
        var windata = {
            type: "normal",
            height: 600,
            width: 400,
            url: transUrl,
        };
        if (gNormalWinOrPopup) {
            windata.type = "normal";
        } else {
            windata.type = "popup";
        }
        creating = browser.windows.create(windata);

    } else {

        var tabdata = {
            //pinned: true,
            url: transUrl,
        };
        creating = browser.tabs.create(tabdata);
    }

    creating.then((wdw) => {
            gTransWinId = wdw.id;
            getTransTabId(gTransWinId);
        },
        (err) => {
            showNotification("Creating Window:", "!" + err);
        })

}

function notifyTranslator(win, bingUrl) {

    var msgData = {
        "name": "urlUpdated",
        "data": bingUrl
    };
    var sent = browser.tabs.sendMessage(gTransTabId, msgData);
    sent.then(() => {
            //showNotification("SendMessage:", "Send Success !!!");
        },
        (err) => {
            showNotification("SendMessage:", "!" + err);
        });
}

function updateTranslator(win, bingUrl) {
    var winData = {
        focused: true,
    }

    var updated = browser.windows.update(win.id, winData);

    updated.then(() => {
            //showNotification("Update:", "Update Success !!!");
            notifyTranslator(win, bingUrl);
        },
        (err) => {
            showNotification("Update Translator:", "!" + err);
        });

}

function showTranslator(bingUrl) {

    var gotWin = browser.windows.get(gTransWinId);
    gotWin.then((win) => updateTranslator(win, bingUrl),
        (err) => createTranslator(bingUrl));

}

function txtSelected(txt) {
    if (gStatus == "on") {
        if (gTimer) {
            clearTimeout(gTimer);
            gTimer = null;
        }


        if (txt == gSelectedTxt) {
            return;
        }

        gSelectedTxt = txt;

        if (txt) {

            gTimer = setTimeout(function() {
                var bingUrl = gTranslatorUrl + txt;
                showTranslator(bingUrl);
            }, 200);
        }
    }
}

function changeUserAgent(req) {
    if (gStatus == "on") {
        if (req.tabId == gTransTabId) {
            for (var header of req.requestHeaders) {
                if (header.name.toLowerCase() === "user-agent") {
                    header.value = gDefaultUserAgent;
                }
            }
        }
    }
    return { requestHeaders: req.requestHeaders };
}

function msgReceived(msg) {
    if (msg.name == "txtSelected") {
        txtSelected(msg.data);
    }
}

browser.browserAction.onClicked.addListener(toggleButton);
browser.runtime.onMessage.addListener(msgReceived);

browser.webRequest.onBeforeSendHeaders.addListener(changeUserAgent, { urls: [gUrlPattern] }, ["blocking", "requestHeaders"]);