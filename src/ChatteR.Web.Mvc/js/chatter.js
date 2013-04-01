/*
 * Requires:
 *  jquery.signalR-1.0.1.js
 */
(function (chatter, $, undefined) {
  chatter.client = {};
  chatter.server = {};

  var chatterHub = $.connection.chatter;
  var connectingCallback;
  var connectedCallback;
  var reconnectingCallback;
  var disconnectedCallback;
  var errorCallback;

  // Client-side callbacks
  // function receiveMessage(message, signature)
  chatter.client.receiveMessage = function (callback) {
    chatterHub.client.receiveMessage = callback;
  };
  // function updateStats(stats)
  chatter.client.updateStats = function (callback) {
    chatterHub.client.updateStats = callback;
  };
  // function connecting(data)
  chatter.client.connecting = function (callback) {
    connectingCallback = callback;
  };
  // function connected(data)
  chatter.client.connected = function (callback) {
    connectedCallback = callback;
  };
  // function reconnecting(data)
  chatter.client.reconnecting = function (callback) {
    reconnectingCallback = callback;
  };
  // function disconnected(data)
  chatter.client.disconnected = function (callback) {
    disconnectedCallback = callback;
  };

  // Server-side calls
  // function joinChatroom(chatroom)
  chatter.server.joinChatroom = function (chatroom) {
    chatterHub.server.joinChatroom(chatroom);
  };
  // function sendMessage(message, signature)
  chatter.server.sendMessage = function (message, signature) {
    chatterHub.server.sendMessage(message, signature);
  };

  // Error event callback
  chatter.error = function (callback) {
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
}(window.chatter = window.chatter || {}, jQuery));