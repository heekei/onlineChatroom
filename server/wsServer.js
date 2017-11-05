
const fs = require('fs');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    // path: "/chat",
    host: '192.168.31.200',
    // host: '172.16.18.4',
    port: 8000
});
var cltCollection = [];

var hisJSON;
try {
    hisJSON = fs.readFileSync('history.json', 'utf-8');
} catch (error) {
    hisJSON = '';
}
if (hisJSON === '') hisJSON = '[]';
chatHistory = JSON.parse(hisJSON);

wss.on('connection', function (ws) {
    cltCollection.push(ws);
    //初始化历史记录
    broadcast({ history: chatHistory });

    /* 收到消息时 */
    ws.on('message', function (message) {
        message = JSON.parse(message);
        chatHistory.push(message);
        message.chat.timestamp = new Date().toLocaleString();
        console.log(message.chat.username + ': ' + message.chat.message);
        message = JSON.stringify(message);
        sendExptSelf(ws, message);
    });

    /* 关闭连接时 */
    ws.on("close", function (e) {
        cltCollection.splice(cltCollection.indexOf(ws), 1);
        broadcast({ "onlinecount": wss.clients.length });
        fs.writeFile('history.json', JSON.stringify(chatHistory), function (err) {
            console.error(err);
        });
    })

    ws.send(
        JSON.stringify(
            {
                "SystemRes": "连接成功！",
                "onlinecount": wss.clients.length
            }
        )
    );
    
    sendExptSelf(ws, { "onlinecount": wss.clients.length });
    console.log('当前在线人数：' + wss.clients.length)
});

/**
 * 广播
 * 
 * @param {{}} data 数据
 */
function broadcast(data) {
    var data = JSON.stringify(data);
    wss.clients.forEach(function (client) {
        client.send(data);
    })
}

/**
 * 向其他客户端发送信息
 * 
 * @param {WebSocket} cli 发送方
 * @param {{}} data 
 */
function sendExptSelf(cli, data) {
    var data = JSON.stringify(data);
    cltCollection.forEach(function (client) {
        if (cli == client) return;
        client.send(data);
    });
}