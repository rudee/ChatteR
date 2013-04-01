/*
 * Requires:
 *  jquery.signalR-1.0.1.js
 */
(function (chatter, $, undefined) {
  var chatterHub = $.connection.chatter;
  var connectingCallback;
  var connectedCallback;
  var reconnectingCallback;
  var disconnectedCallback;
  var errorCallback;

  // Core event callbacks
  chatter.joinChatroom = function (chatroom) {
    chatterHub.server.joinChatroom(chatroom);
  };
  chatter.sendMessage = function (message, signature) {
    chatterHub.server.sendMessage(message, signature);
  };
  chatter.receiveMessage = function (callback) {
    chatterHub.client.receiveMessage = callback;
  };
  chatter.updateStats = function (callback) {
    chatterHub.client.updateStats = callback;
  };

  // stateChanged event callbacks
  chatter.connecting = function (callback) {
    connectingCallback = callback;
  };
  chatter.connected = function (callback) {
    connectedCallback = callback;
  };
  chatter.reconnecting = function (callback) {
    reconnectingCallback = callback;
  };
  chatter.disconnected = function (callback) {
    disconnectedCallback = callback;
  };

  // error event callback
  chatter.error = function (callback) {
    errorCallback = callback;
  };

  // Start the connection
  $.connection.hub.start();
  // Log
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