/*
 * Copyright (c) 2019 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Sam Hermans <sam.hermans@gmail.com>
 */

"use strict";

let WebSocketServer = require('websocket').server;
let http = require('http');
const WS_PORT = 8484;

// Clear the screen
let Logger = require('logger');
let log = new Logger();
log.clearScreen();
log.warning("Starting WS Server");


// Create websocket server
let server = http.createServer(function(request, response) {
    log.message(' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

// Listen on the 127.0.0.1:WS_PORT
server.listen(WS_PORT, "127.0.0.1" , function() {
    log.warning('Server is listening on port ' + WS_PORT);
});

// Setup the wsServer
let wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

// New incoming requests
wsServer.on('request', function(request) {

    var connection = request.accept('echo-protocol', request.origin);
    log.warning('Connection accepted. ' + connection.remoteAddress);

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            log.notice('<< Received Message: ' + message.utf8Data);
            //connection.sendUTF(message.utf8Data);
        }
    });

    connection.on('close', function(reasonCode, description) {
        log.warning('Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

// Ping loop
setInterval(ping, 1000);


// Server functions
function ping() {
    if(wsServer.connections.length > 0) {
        log.notice('Sending ping to ' + wsServer.connections.length + ' clients:');

        let txt = JSON.stringify({cmd: 'PING'});
        wsServer.broadcastUTF(txt);
        log.notice('>> ' + txt);
    }
}