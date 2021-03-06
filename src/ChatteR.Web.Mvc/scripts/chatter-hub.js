﻿/*
 * Requires:
 *  jquery.signalR-1.0.1.js
 */
(function (chatterHub, $, undefined) {
  chatterHub.client = {};
  chatterHub.server = {};

  var _chatterHub = $.connection.chatter;
  var connectingCallback;
  var connectedCallback;
  var reconnectingCallback;
  var disconnectedCallback;
  var errorCallback;

  // Client-side callbacks
  // function receiveMessage(data)
  chatterHub.client.receiveMessage = function (callback) {
    _chatterHub.client.receiveMessage = callback;
  };
  // function updateStatus(data)
  chatterHub.client.updateStatus = function (callback) {
    _chatterHub.client.updateStatus = callback;
  };
  // function connecting(data)
  chatterHub.client.connecting = function (callback) {
    connectingCallback = callback;
  };
  // function connected(data)
  chatterHub.client.connected = function (callback) {
    connectedCallback = callback;
  };
  // function reconnecting(data)
  chatterHub.client.reconnecting = function (callback) {
    reconnectingCallback = callback;
  };
  // function disconnected(data)
  chatterHub.client.disconnected = function (callback) {
    disconnectedCallback = callback;
  };

  // Server-side calls
  // function joinChatroom(chatroom)
  chatterHub.server.joinChatroom = function (data) {
    _chatterHub.server.joinChatroom(data);
  };
  // function sendMessage(data)
  chatterHub.server.sendMessage = function (data) {
    _chatterHub.server.sendMessage(data);
  };
  // function updateUsername(data)
  chatterHub.server.updateUsername = function (data) {
    _chatterHub.server.updateUsername(data);
  };

  // Error event callback
  chatterHub.error = function (callback) {
    errorCallback = callback;
  };

  // Start the connection
  $.connection.hub.start();
  // Execute error callback on error event
  $.connection.hub.error(function (data) {
    if (errorCallback) {
      errorCallback(data);
    }
  });
  // Execute callbacks on stateChanged event
  $.connection.hub.stateChanged(function (data) {
    if (data.newState === $.signalR.connectionState.connecting && connectingCallback) {
      connectingCallback(data);
    } else if (data.newState === $.signalR.connectionState.connected && connectedCallback) {
      connectedCallback(data);
    } else if (data.newState === $.signalR.connectionState.reconnecting && reconnectingCallback) {
      reconnectingCallback(data);
    } else if (data.newState === $.signalR.connectionState.disconnected && disconnectedCallback) {
      disconnectedCallback(data);
    }
  });
}(window.chatterHub = window.chatterHub || {}, jQuery));