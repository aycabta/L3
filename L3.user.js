// ==UserScript==
// @name        L3: Lingr Log Loader
// @namespace   http://aycabta.github.io/
// @include     http://lingr.com/
// @version     0.0.1
// @description Add "Load log" button
// @grant       none
// @copyright   2016+, Code Ass
// ==/UserScript==

(function() {
    if (!window.XMLHttpRequest){
        XMLHttpRequest = function () {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.6.0");
            } catch (e) {}
            try {
                return new ActiveXObject("Msxml2.XMLHTTP.3.0");
            } catch (e) {}
            try {
                return new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {}
            throw new Error("This browser does not support XMLHttpRequest.");
        };
    }
    function processLog(messagesContainer, domObj, hash) {
        var messages = document.importNode(domObj.getElementsByClassName('messages')[0], true);
        var xpath;
        if (hash && domObj.getElementById(hash)) {
            xpath = '//div[@id="' + hash + '"]/preceding-sibling::div[contains(@class, "message")]';
        } else {
            xpath = '//div[contains(@class, "message")]';
        }
        var messagesLog = document.evaluate(xpath, messages, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        var lastHash;
        for (var i = messagesLog.snapshotLength - 1; i >= 0; i--) {
            var message = messagesLog.snapshotItem(i);
            messagesContainer.prepend(message);
            lastHash = message.id;
        }
        return lastHash;
    }
    function loadLog(readmore) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', readmore.href, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var domParser = new DOMParser();
                var domObj = domParser.parseFromString(xhr.responseText, 'text/html');
                var hash;
                if (readmore.hash !== '') {
                    hash = readmore.hash.substring(1);
                } else if (readmore.dataset.hash !== '') {
                    hash = readmore.dataset.hash;
                }
                var messagesContainer = readmore.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('messages')[0];
                var lastHash = processLog(messagesContainer, domObj, hash);
                readmore.href = domObj.getElementsByClassName('prev')[0].firstChild.href;
                readmore.dataset.hash = lastHash;
            }
        };
        xhr.send(null);
    }
    function run() {
        var xpath = '//div[@class="readmore"]//a[text()="Read more from archives"]';
        var readmores = document.evaluate(xpath, document.body, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var i = 0; i < readmores.snapshotLength; i++) {
            var readmore = readmores.snapshotItem(i);
            var load = document.createElement('a');
            load.innerHTML = 'Load log';
            readmore.parentNode.insertBefore(load, readmore);
            readmore.parentNode.insertBefore(document.createTextNode(' '), readmore);
            var slash = document.createElement('span');
            slash.innerHTML = '/';
            readmore.parentNode.insertBefore(slash, readmore);
            readmore.parentNode.insertBefore(document.createTextNode(' '), readmore);
            load.onclick = (function(rm) {
                return function() {
                    loadLog(rm);
                    return false;
                };
            })(readmore);
        }
    };
    var intervalID = setInterval(function() {
        var spinner = document.getElementById('spinner');
        if (spinner !== null && spinner.style.display == 'none') {
            clearInterval(intervalID);
            run();
        }
    }, 1000);
})();

