/*
 * Copyright (c) 2019 - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Sam Hermans <sam.hermans@gmail.com>
 */

"use strict";

let WebSocketClient = require('websocket').client;
let client = new WebSocketClient();
let conn = {};

const WS_PORT = 8484;
const RECONNECTINT = 5000;


// Clear the screen
let Logger = require('logger');
let log = new Logger();
log.clearScreen();
log.warning("Starting WS Client");

// Make initial connection
reconnect(10);



// Failed connection
client.on('connectFailed', function(error) {
    log.error('Connect Error: ' + error.toString());
    reconnect();
});

// Successful connection
client.on('connect', function(connection) {
    conn.connection = connection;
    log.warning('WebSocket Client Connected');

    conn.connection.on('error', function(error) {
        log.error("Connection Error: " + error.toString());
        reconnect();
    });

    conn.connection.on('close', function() {
        log.error('Connection Closed');
        reconnect();
    });

    conn.connection.on('message', function(message) {
        if (message.type === 'utf8') {
            let data = JSON.parse(message.utf8Data);
            console.log(data);

            if(data.cmd == 'PING') {
                let txt = JSON.stringify({cmd: 'PONG'});
                wsSendText(txt)
            }
        }
    });

});


function reconnect(timer = RECONNECTINT) {

    setTimeout(function()  {
        const server = 'ws://localhost:'+ WS_PORT +'/';
        log.warning('Connecting to '+ server);
        client.connect(server, 'echo-protocol');
    }, timer);
}

function wsSendText(txt) {
    if(conn.connection.connected) {
        //log.notice(">> " + txt);
        conn.connection.sendUTF(txt);
    }
}

