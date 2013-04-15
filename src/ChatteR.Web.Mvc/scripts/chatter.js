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
  var $username = $("input[name=username]");
  var $messageAndUsername = $("textarea[name=message], input[name=username]");
  var $send = $("input[name=send]");
  var $stats = $("#stats");
  var $users = $("#users");
  var $chatrooms = $("#chatrooms");
  var $version = $("#version");
  var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var username = null;
  var updateUsernameTimeout;
  var unreadMsgCount = 0;
  var version = null;
  var isUpdating = false;
  var titleBase = $title.html().substring($title.html().search(/&ndash; (\w*)$/) + 9);
  if (titleBase === "") {
    titleBase = $title.html();
  }

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
    var title = ($chatroom.val() === "" ? "" : ($chatroom.val() + " &ndash; ")) + titleBase;
    if (unreadMsgCount > 0) {
      title += " (" + unreadMsgCount + ")";
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

  function updateUsername() {
    if (username === null || username !== $username.val()) {
      chatterHub.server.updateUsername({ username: $username.val() });
      username = $username.val();
    }
  }

  function resetUpdateUsernameTimeout(delay) {
    clearTimeout(updateUsernameTimeout);
    updateUsernameTimeout = setTimeout(updateUsername, delay);
  }

  function bindChatroomClick() {
    if (window.history && window.history.pushState) {
      $("#chatrooms a").click(function (e) {
        var data = {
          chatroom: $(this).data("chatroom"),
          username: $username.val(),
          href:     $(this).prop("href")
        };
        joinChatroom(data);
        window.history.pushState({
          chatroom: data.chatroom,
          href: data.href
        }, "", data.href);
        return false;
      });
    }
  }

  // joinChatroom({
  //   chatroom: "chatroom",
  //   username: "username",
  //   href:     "href"
  // });
  function joinChatroom(data) {
    chatterHub.server.joinChatroom({
      username: data.username,
      chatroom: data.chatroom
    });
    $chatroom.val(data.chatroom);
    resetUnreadMsgCount();
    updateTitle();
    $messages.append("<p>Joined " + (data.chatroom === "" ? "&ndash; Main &ndash;" : data.chatroom) + " chatroom</p>");
  }

  chatterHub.client.receiveMessage(function (data) {
    incrementUnreadMsgCount();
    var date = new Date(data.timestamp);
    var $messageContent = $('<div class="message">'
                          +   '<div>'
                          +     '<div class="content">' + data.message + '</div>'
                          +     '<p class="username"><time title="' + formatDate(date) + '" datetime="' + date.toUTCString() + '">' + formatTime(date) + '</time> ' + data.username + '</p>'
                          +   '</div>'
                          + '</div>');
    $messages.append($messageContent);
    $htmlbody.animate({ scrollTop: $messageContent.offset().top }, 500, function () {
      $message.focus();
    });
  });

  chatterHub.client.updateStatus(function (data) {
    data = $.parseJSON(data);
    if (version !== null && version !== data.version) {
      var msg = "You are currently using version " + version + "."
              + " This page will now reload to acquire a new version (" + data.version + ")";
      if (isUpdating === false) {
        isUpdating = true;
        alert(msg);
        location.reload(true);
      }
      return;
    }

    version = data.version;

    var currentChatroomName = $chatroom.val() === "" ? '&ndash; Main &ndash;' : $chatroom.val();
    var usersHtml = "";
    var chatroomsHtml = "<p>Chatrooms:<ul>";
    var numOfUsers = 0;
    var totNumOfUsers = 0;
    $.each(data.chatrooms, function (chatroomIndex, chatroomValue) {
      if (chatroomValue.name === $chatroom.val()) {
        numOfUsers = chatroomValue.users.length;
      }
      var users = [];
      $.each(chatroomValue.users, function (userIndex, userValue) {
        if (chatroomValue.name === $chatroom.val()) {
          usersHtml += "<li>" + userValue.username + "</li>";
        }
        users.push(userValue.username);
      });
      chatroomsHtml += '<li><a href="' + baseUrl + chatroomValue.name + '" title="Join chatroom" data-chatroom="' + chatroomValue.name + '">' + (chatroomValue.name === "" ? '&ndash; Main &ndash;' : chatroomValue.name) + '</a> <span title="' + users.join(", ") + '">(' + chatroomValue.users.length + ')</span></li>';
      totNumOfUsers += chatroomValue.users.length;
    });
    usersHtml = "<p>" + numOfUsers + " user(s) in current chatroom " + currentChatroomName + ":<ul>" + usersHtml + "</ul></p>";
    chatroomsHtml += "</ul></p>";

    $users.html(usersHtml);
    $chatrooms.html(chatroomsHtml);
    $stats.html("<p>" + totNumOfUsers + " user(s) in " + data.chatrooms.length + " chatroom(s) on " + formatDate(new Date(data.date)) + "</p>");
    $version.html("Version: " + version);

    bindChatroomClick();
  });

  chatterHub.client.connected(function (data) {
    console.log("Connected");
    // Join the chatroom
    chatterHub.server.joinChatroom({
      username: $username.val(),
      chatroom: $chatroom.val()
    });
    // Call the server's sendMessage function on submit
    $form.submit(function () {
      var username = $username.val();
      if (/\S/.test($message.val())) {
        chatterHub.server.sendMessage({
          message: $message.val(),
          username: username
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
    $username.prop("disabled", false);
    $send.prop("disabled", false);
  });

  chatterHub.client.reconnecting(function (data) {
    console.log("Re-connecting...");
    // Disable form while reconnecting
    $message.prop("disabled", true).prop("placeholder", "Re-connecting to server. Please wait...");
    $username.prop("disabled", true);
    $send.prop("disabled", true);
  });

  // Submit when CTRL-ENTER is pressed while inside the message textarea
  $messageAndUsername.keypress(function (e) {
    resetUnreadMsgCount();
    if (e.ctrlKey === true && (e.keyCode === 10 || e.keyCode === 13)) {
      $form.submit();
    }
  });

  // Reset unread message count on user action
  $(window).click(function (e) {
    resetUnreadMsgCount();
  }).keyup(function (e) {
    resetUnreadMsgCount();
  });

  // Update username on key press
  $username.change(function () {
    resetUpdateUsernameTimeout(0);
  }).keyup(function () {
    resetUpdateUsernameTimeout(3000);
  }).mouseup(function () {
    resetUpdateUsernameTimeout(3000);
  }).mousedown(function () {
    resetUpdateUsernameTimeout(3000);
  });

  if (window.history && window.history.pushState) {
    window.onpopstate = function (e) {
      joinChatroom({
        chatroom: e.state.chatroom,
        username: $username.val(),
        href:     e.state.href
      });
    };
    window.history.replaceState({
      chatroom: $chatroom.val(),
      href:     window.location.href
    }, "", window.location.href);
  }

  $noscript.remove();
});