// var wsURL = "ws://192.168.9.93:8080"; //m2
// var wsURL = "ws://172.16.18.4:8080";  //m1
var wsURL = "ws://115.28.247.208:8080";
var ws = new WebSocket(wsURL);
ws.onopen = onOpen;
ws.onmessage = onMessage;
ws.onerror = onError;
ws.onclose = function (e) {
    onClose();
    reConnect(ws)
}
// TODO: this todo is valid
function reConnect(oldWS) {
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
    if (typeof jsonObj.onlinecount == "number") {
        document.querySelector(".SystemRes").innerHTML = "当前在线人数：" + jsonObj.onlinecount;
    }
    if (jsonObj.chat) {//用户聊天消息
        var li = '<li class="mb-msgrow">'
            + '<img src="images/avatar.png" class="friend-avatar" alt="">'
            + '<div class="msg" title="发送时间：' + new Date(jsonObj.chat.timestamp).toLocaleString() + '">'
            + jsonObj.chat.message
            + '</div>'
            + '</li>';
        document.querySelector(".mb-main > ul").innerHTML += li;
        notifyMe(jsonObj.chat.username, jsonObj.chat.message)
    }
    document.querySelector(".mb-main").scrollTop = document.querySelector(".mb-main").scrollHeight;

}
function onError(e) {
    document.querySelector(".SystemRes").innerHTML = "服务器连接端断开，正在尝试重连；当前在线人数：未知";
}
function onClose() {
    document.querySelector(".SystemRes").innerHTML = "服务器连接端断开，正在尝试重连；当前在线人数：未知";
}
//发消息
document.querySelector("button[type=submit]").addEventListener("click", function (e) {
    e.preventDefault();
    postMsg("测试"/*document.querySelector("#username").value*/, document.querySelector(".mb-ready2post").innerHTML);
    document.querySelector(".mb-ready2post").innerHTML = "";
    document.querySelector(".mb-main").scrollTop = document.querySelector(".mb-main").scrollHeight;
})
document.querySelector(".mb-ready2post").addEventListener("keypress", function (e) {
    if (e.ctrlKey && e.keyCode === 10) {
        postMsg("测试"/*document.querySelector("#username").value*/, document.querySelector(".mb-ready2post").innerHTML);
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
        )
        var li = '<li class="mb-msgrow self">'
            + '<img src="images/avatar.png" class="friend-avatar" alt="">'
            + '<div class="msg">'
            + message
            + '</div>'
            + '</li>';
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
            "tag":"userchat"
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