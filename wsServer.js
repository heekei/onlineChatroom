
var WebSocketServer = require('ws').Server
    , wss = new WebSocketServer({
        // path: "/chat",
        host: '192.168.31.200',
        // host: '172.16.18.4',
        port: 8080
    });
var cltCollection = [];
wss.on('connection', function (ws) {
    cltCollection.push(ws);
    ws.on('message', function (message) {
        message = JSON.parse(message);
        message.chat.timestamp = new Date().toLocaleString();
        message = JSON.stringify(message);
        console.log('received: %s', message);
        sendExptSelf(ws, message);
    });
    ws.on("close", function (e) {
        cltCollection.splice(cltCollection.indexOf(ws),1);
        broadcast(
            JSON.stringify(
                {
                    "onlinecount": wss.clients.length
                }
            )
        );
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
    console.log(wss.clients.length)
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