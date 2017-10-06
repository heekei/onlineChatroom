
const fs = require('fs');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({
    // path: "/chat",
    host: '192.168.31.200',
    // host: '172.16.18.4',
    port: 8000
});
var cltCollection = [];

var hisJSON = fs.readFileSync('history.json', 'utf-8');
if (hisJSON === '') hisJSON = '[]';
chatHistory = JSON.parse(hisJSON);

wss.on('connection', function (ws) {
    cltCollection.push(ws);
    //初始化历史记录
    broadcast(JSON.stringify({
        history: chatHistory
    }));
    ws.on('message', function (message) {
        message = JSON.parse(message);
        chatHistory.push(message);
        message.chat.timestamp = new Date().toLocaleString();
        console.log(message.chat.username + ': ' + message.chat.message);
        message = JSON.stringify(message);
        sendExptSelf(ws, message);
    });
    ws.on("close", function (e) {
        cltCollection.splice(cltCollection.indexOf(ws), 1);
        broadcast(
            JSON.stringify(
                {
                    "onlinecount": wss.clients.length
                }
            )
        );
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
    sendExptSelf(ws,
        JSON.stringify(
            {
                "onlinecount": wss.clients.length
            }
        )
    )
    console.log('当前在线人数：' + wss.clients.length)
});
function broadcast(data) {
    wss.clients.forEach(function (client) {
        client.send(data);
    })
}
function sendExptSelf(cli, data) {
    cltCollection.forEach(function (client) {
        if (cli == client) return;
        client.send(data);
    })
}