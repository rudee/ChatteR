/*
 * Requires:
 *  jquery-1.9.1.js
 *  chatter.js
 */
$(function () {
  var $title = $("title");
  var $chatter = $("#chatter");
  var $messages = $("#messages");
  var $form = $("#form");
  var $chatroom = $("input[name=chatroom]");
  var $message = $("textarea[name=message]");
  var $signature = $("input[name=signature]");
  var $send = $("input[name=send]");
  var $stats = $("#stats");
  var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var unreadMsgCount = 0;

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
    var title = $title.html();
    if (title.indexOf("*") === -1) {
      title = "*" + title;
      try {
        $title.html(title);
      } catch (e) {}
    }
  }

  function clearDirtyTitle() {
    var title = $title.html();
    if (title.indexOf("*") !== -1) {
      title = title.substring(1, title.length);
      try {
        $title.html(title);
      } catch (e) {}
    }
  }

  chatter.client.receiveMessage(function (message, signature) {
    setDirtyTitle();
    var $messageContent = $("<div class=\"message\"><div><div class=\"content\">" + message + "</div><p class=\"signature\">" + signature + "</p></div></div>");
    $messages.append($messageContent);
    $("html,body").animate({ scrollTop: $messageContent.offset().top }, 500, function () {
      $message.focus();
    });
  });

  chatter.client.updateStats(function (stats) {
    stats = $.parseJSON(stats);
    $stats.html("<p>About " + stats.numOfClients + " user(s) in " + stats.numOfChatrooms + " chatroom(s) at " + formatDate(new Date(stats.date)) + "</p>");
  });

  chatter.client.connected(function (data) {
    console.log("Connected");
    // Join the chatroom
    chatter.server.joinChatroom($chatroom.val());
    // Call the server's sendMessage function on submit
    $form.submit(function () {
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
    $chatter.show();
    $message.prop("disabled", false).prop("placeholder", "Message (CTRL-ENTER to send)").focus();
    $signature.prop("disabled", false);
    $send.prop("disabled", false);
  });

  chatter.client.reconnecting(function (data) {
    console.log("Re-connecting...");
    // Disable form
    $message.prop("disabled", true).prop("placeholder", "Re-connecting to server. Please wait...");
    $signature.prop("disabled", true);
    $send.prop("disabled", true);
  });

  // Submit when CTRL-ENTER is pressed while inside the message textarea
  $message.keypress(function (e) {
    clearDirtyTitle();
    if (e.ctrlKey === true && (e.keyCode === 10 || e.keyCode === 13)) {
      $form.submit();
    }
  }).click(function () {
    clearDirtyTitle();
  });
});