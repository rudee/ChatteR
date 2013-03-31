﻿$(function () {
  var $chatroom = $("input[name=chatroom]");
  var $message = $("textarea[name=message]");
  var $signature = $("input[name=signature]");
  var $send = $("input[name=send]");

  // Get the chatter hub
  var chatter = $.connection.chatter;

  // Set up the client's receiveMessage function
  chatter.client.receiveMessage = function (message, signature) {
    setDirtyTitle();
    //var $messageContent = $("<div class=\"message\"><div><div class=\"content\">" + formatMessage(message) + "</div><p class=\"signature\">" + signature + "</p></div></div>");
    var $messageContent = $("<div class=\"message\"><div><div class=\"content\">" + message + "</div><p class=\"signature\">" + signature + "</p></div></div>");
    $("#messages").append($messageContent);
    $("html,body").animate({ scrollTop: $messageContent.offset().top }, 500, function () {
      $message.focus();
    });
  };
  // Set up the client's updateStats function
  chatter.client.updateStats = function (stats) {
    $("#stats").html("<p>About " + stats.numOfClients + " user(s) in " + stats.numOfChatrooms + " chatroom(s) at " + formatDate(new Date(stats.date)) + "</p>");
  };

  // Start the connection
  $.connection.hub.start();
  $.connection.hub.error(function (data) {
    console.log(data);
  });
  $.connection.hub.stateChanged(function (change) {
    if (change.newState === $.signalR.connectionState.connecting) {
      console.log("Connecting...");
    } else if (change.newState === $.signalR.connectionState.connected) {
      console.log("Connected");
      // Join the chatroom
      chatter.server.joinChatroom($chatroom.val());
      // Call the server's sendMessage function on submit
      $("#form").submit(function () {
        var signature = $signature.val();
        if (/\S/.test($message.val())) {
          chatter.server.sendMessage($message.val(), signature);
          $message.val("");
        } else {
          $message.focus();
        }
        return false;
      });
      // Display/Enable form
      $("#chatter").show();
      $message.prop("disabled", false).prop("placeholder", "Message (CTRL-ENTER to send)").focus();
      $signature.prop("disabled", false);
      $send.prop("disabled", false);
    } else if (change.newState === $.signalR.connectionState.reconnecting) {
      console.log("Re-connecting...");
      // Disable form
      $message.prop("disabled", true).prop("placeholder", "Re-connecting to server. Please wait...");
      $signature.prop("disabled", true);
      $send.prop("disabled", true);
    } else if (change.newState === $.signalR.connectionState.disconnected) {
      console.log("Disconnected");
    }
  });

  // Submit when CTRL-ENTER is pressed while inside the message textarea
  $("textarea[name=message]").keypress(function (e) {
    clearDirtyTitle();
    if (e.ctrlKey === true && (e.keyCode === 10 || e.keyCode === 13)) {
      $("#form").submit();
    }
  }).click(function () {
    clearDirtyTitle();
  });
});

var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatMessage(message) {
  var lines = message.split('\n');
  var linesWithContent = [];
  var trimmedLine;
  var i = 0;
  while (i < lines.length) {
    if (lines[i].indexOf(" ") === 0) {
      return "<pre>" + message + "</pre>";
    }
    trimmedLine = $.trim(lines[i]);
    if (trimmedLine !== "") {
      linesWithContent.push(trimmedLine);
    }
    i++;
  }
  return "<p>" + linesWithContent.join("</p><p>") + "</p>";
}

function formatDate(date) {
  var ampm = "AM";
  var hours = date.getHours();
  if (hours > 12) {
    hours = hours - 12;
    ampm = "PM";
  }
  if (hours < 10) {
    hours = "0" + hours.toString();
  }
  var minutes = date.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes.toString();
  }
  var seconds = date.getSeconds();
  if (seconds < 10) {
    seconds = "0" + seconds.toString();
  }
  return weekday[date.getDay()] + ", " + date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear() + " " + hours + ":" + minutes + ":" + seconds + " " + ampm;
}

function setDirtyTitle() {
  var $title = $("title");
  var title = $title.html();
  if (title.indexOf("*") === -1) {
    title = "*" + title;
    $title.html(title);
  }
}

function clearDirtyTitle() {
  var $title = $("title");
  var title = $title.html();
  if (title.indexOf("*") !== -1) {
    title = title.substring(1, title.length);
    $title.html(title);
  }
}