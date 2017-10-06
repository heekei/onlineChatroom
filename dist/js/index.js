var wsURL = "ws://192.168.31.200:8000"; //m2
// var wsURL = "ws://172.16.18.4:8080";  //m1
// var wsURL = "ws://alimm.iask.in";
var ws = new WebSocket(wsURL);
ws.onopen = onOpen;
ws.onmessage = onMessage;
ws.onerror = onError;
const maxReconnectTimes = 3;
var reconnectNum = 1;
const reconnectTime = 3000;
ws.onclose = function (e) {
    onClose();
    setTimeout(function () {
        ++reconnectNum;
        reConnect(ws);
    }, reconnectTime);
}
// TODO: this todo is valid
var joined = false;//初始化
function reConnect(oldWS) {
    if (reconnectNum > maxReconnectTimes) {
        document.querySelector(".SystemRes").innerHTML = "连接失败，请稍后再试！";
        return;
    }
    ws = new WebSocket(wsURL);
    ws.onopen = oldWS.onopen;
    ws.onmessage = oldWS.onmessage;
    ws.onerror = oldWS.onerror;
    ws.onclose = oldWS.onclose;
}
function onOpen() {
    document.querySelector(".SystemRes").innerHTML = "正在连接服务器";

}
function onMessage(res) {
    var jsonObj = JSON.parse(res.data)
    if (jsonObj.SystemRes) {//系统消息
        document.querySelector(".SystemRes").innerHTML = jsonObj.SystemRes;
    }
    if (!joined && jsonObj.history) {//历史记录读取
        for (var i = 0; i < jsonObj.history.length; i++) {
            var msg = jsonObj.history[i];
            document.querySelector(".mb-main > ul").innerHTML += generateDOM(msg);
        }
        joined = true;
    }
    if (typeof jsonObj.onlinecount == "number") {
        document.querySelector(".SystemRes").innerHTML = "当前在线人数：" + jsonObj.onlinecount;
    }
    if (jsonObj.chat) {//用户聊天消息
        document.querySelector(".mb-main > ul").innerHTML += generateDOM(jsonObj);
        notifyMe(jsonObj.chat.username, jsonObj.chat.message)
    }
    document.querySelector(".mb-main").scrollTop = document.querySelector(".mb-main").scrollHeight;

}
function onError(e) {
    document.querySelector(".SystemRes").innerHTML = "服务器连接发生错误：" + e.type;
}
function onClose() {
    document.querySelector(".SystemRes").innerHTML = "服务器连接失败，正在尝试第" + reconnectNum + "次重连";
}
//发消息
document.querySelector("button[type=submit]").addEventListener("click", function (e) {
    e.preventDefault();
    if (document.querySelector('#username').value === '') return;
    postMsg(document.querySelector("#username").value, document.querySelector(".mb-ready2post").innerHTML);
    document.querySelector(".mb-ready2post").innerHTML = "";
    document.querySelector(".mb-main").scrollTop = document.querySelector(".mb-main").scrollHeight;
})
document.querySelector(".mb-ready2post").addEventListener("keypress", function (e) {
    if (document.querySelector('#username').value === '') return;
    if (e.ctrlKey && e.keyCode === 10) {
        postMsg(document.querySelector("#username").value, document.querySelector(".mb-ready2post").innerHTML);
        document.querySelector(".mb-ready2post").innerHTML = "";
        document.querySelector(".mb-main").scrollTop = document.querySelector(".mb-main").scrollHeight;
    }
    return false;
})


/**
 * 发送消息
 * 
 * @param {any} uname 用户名
 * @param {any} message 消息
 */
function postMsg(uname, message) {
    if (message.trim()) {
        ws.send(
            MessageStruct(
                uname,
                message
            )
        );
        var msgObj = {
            chat: {
                username: uname,
                message: message
            }
        };
        // var li = '<li class="mb-msgrow self">'
        //     + '<img src="images/avatar.png" class="friend-avatar" alt="">'
        //     + '<div class="msg">'
        //     + message
        //     + '</div>'
        //     + '</li>';
        var li = generateDOM(msgObj);
        document.querySelector(".mb-main > ul").innerHTML += li;
    }
}
/**
 * 消息结构化
 * 
 * @param {any} uname 用户名
 * @param {any} message 消息
 * @returns
 */
function MessageStruct(uname, message) {
    return JSON.stringify(
        {
            "chat": {
                "username": uname,
                "message": message
            }
        }
    )
}
function notifyMe(username, message) {
    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
        return false;
    }
    // Let's check if the user is okay to get some notification
    else if (Notification.permission === "granted") {
        // If it's okay let's create a notification
        var notification = new Notification(username, {
            "body": message,
            "icon": "images/avatar.png",
            "tag": "userchat"
        });
        notification.onclick = function (e) {
            window.focus();
        }
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission(function (permission) {
            // If the user is okay, let's create a notification
            if (permission === "granted") {
                var notification = new Notification(username, {
                    "body": message,
                    "icon": "images/avatar.png"
                });
                notification.onclick = function (e) {
                    window.focus();
                }
            }
        });
    }

    // At last, if the user already denied any notification, and you 
    // want to be respectful there is no need to bother them any more.
}

function generateDOM(msg) {
    var isSelf = msg.chat.username === document.querySelector('#username').value;
    var li = '<li class="mb-msgrow' + (isSelf ? ' self' : '') + '">'
        + '<i class="friend-avatar" title="' + msg.chat.username + '"></i>'
        + '<div class="msg" title="发送时间：' + new Date(msg.chat.timestamp).toLocaleString() + '">'
        + msg.chat.message
        + '</div>'
        + '</li>';
    return li;
}