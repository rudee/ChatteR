/*
 * Requires:
 *  jquery-1.9.1.js
 *  chatter-hub.js
 */
$(function () {
  var $htmlbody = $("html,body");
  var $noscript = $("#noscript");
  var $title = $("title");
  var $chatter = $("#chatter");
  var $messages = $("#messages");
  var $form = $("#form");
  var $chatroom = $("input[name=chatroom]");
  var $message = $("textarea[name=message]");
  var $signature = $("input[name=signature]");
  var $messageAndSignature = $("textarea[name=message], input[name=signature]");
  var $send = $("input[name=send]");
  var $stats = $("#stats");
  var $version = $("#version");
  var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var unreadMsgCount = 0;
  var version = null;
  var isUpdating = false;

  function formatTime(date) {
    var ampm = "AM";
    var hours = date.getHours();
    if (hours > 12) {
      hours = hours - 12;
      ampm = "PM";
    }
    if (hours === 0) {
      hours = 12;
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
    return hours + ":" + minutes + ":" + seconds + " " + ampm;
  }

  function formatDate(date) {
    return weekday[date.getDay()] + ", " + date.getDate() + " " + month[date.getMonth()] + " " + date.getFullYear() + " " + formatTime(date);
  }

  function updateTitle() {
    var title = $title.html();
    var regex = /^\(\d+\) /;
    if (unreadMsgCount === 0) {
      title = title.replace(regex, "");
    } else if (regex.test(title)) {
      title = title.replace(regex, "(" + unreadMsgCount + ") ");
    } else {
      title = "(" + unreadMsgCount + ") " + title;
    }
    try {
      $title.html(title);
    } catch (e) { }
  }

  function incrementUnreadMsgCount() {
    unreadMsgCount++;
    updateTitle();
  }

  function resetUnreadMsgCount() {
    unreadMsgCount = 0;
    updateTitle();
  }

  chatterHub.client.receiveMessage(function (data) {
    incrementUnreadMsgCount();
    var date = new Date(data.timestamp);
    var $messageContent = $('<div class="message">'
                          +   '<div>'
                          +     '<div class="content">' + data.message + '</div>'
                          +     '<p class="signature"><time title="' + formatDate(date) + '" datetime="' + date.toUTCString() + '">' + formatTime(date) + '</time> ' + data.signature + '</p>'
                          +   '</div>'
                          + '</div>');
    $messages.append($messageContent);
    $htmlbody.animate({ scrollTop: $messageContent.offset().top }, 500, function () {
      $message.focus();
    });
  });

  chatterHub.client.updateStats(function (stats) {
    stats = $.parseJSON(stats);
    if (version !== null && version !== stats.version) {
      var msg = "You are currently using version " + version + "."
              + " This page will now reload to acquire a new version (" + stats.version + ")";
      if (isUpdating === false) {
        isUpdating = true;
        alert(msg);
        location.reload(true);
      }
      return;
    }
    version = stats.version;
    $stats.html("<p>About " + stats.numOfClients + " user(s) in " + stats.numOfChatrooms + " chatroom(s) at " + formatDate(new Date(stats.date)) + "</p>");
    $version.html("Version: " + version);
  });

  chatterHub.client.connected(function (data) {
    console.log("Connected");
    // Join the chatroom
    chatterHub.server.joinChatroom($chatroom.val());
    // Call the server's sendMessage function on submit
    $form.submit(function () {
      var signature = $signature.val();
      if (/\S/.test($message.val())) {
        chatterHub.server.sendMessage({
          message: $message.val(),
          signature: signature
        });
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

  chatterHub.client.reconnecting(function (data) {
    console.log("Re-connecting...");
    // Disable form while reconnecting
    $message.prop("disabled", true).prop("placeholder", "Re-connecting to server. Please wait...");
    $signature.prop("disabled", true);
    $send.prop("disabled", true);
  });

  // Submit when CTRL-ENTER is pressed while inside the message textarea
  $messageAndSignature.keypress(function (e) {
    resetUnreadMsgCount();
    if (e.ctrlKey === true && (e.keyCode === 10 || e.keyCode === 13)) {
      $form.submit();
    }
  });

  // Reset unread message count on user action
  $(window).click(function (e) {
    resetUnreadMsgCount();
  }).keydown(function (e) {
    resetUnreadMsgCount();
  });

  $noscript.remove();
});