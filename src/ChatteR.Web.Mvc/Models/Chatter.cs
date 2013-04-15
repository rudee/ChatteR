using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web;

namespace ChatteR.Web.Mvc.Models
{
    /// <summary>
    /// Keeps track of all Chatrooms and Connection IDs in each Chatroom.
    /// </summary>
    public class Chatter
    {
        public Chatter()
        {
            _chatroomToConnectionIds = new Dictionary<string, HashSet<string>>();
            _connectionIdToChatroom  = new Dictionary<string, string>();
            _connectionIdToUsername  = new Dictionary<string, string>();
        }

        public IEnumerable<Chatroom> Chatrooms
        {
            get
            {
                return _chatroomToConnectionIds.Select(c =>
                {
                    IEnumerable<User> users = c.Value.Select(cid => new User(cid, _connectionIdToUsername[cid]));
                    return new Chatroom(c.Key, users);
                });
            }
        }

        /// <summary>
        /// Adds or updates the <paramref name="connectionId"/> with the specified
        /// <paramref name="username"/> and <paramref name="chatroom"/>.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <param name="username"></param>
        /// <param name="chatroom"></param>
        public void AddOrUpdate(string connectionId,
                                string username,
                                string chatroom)
        {
            if (chatroom != null)
            {
                if (!_chatroomToConnectionIds.ContainsKey(chatroom))
                {
                    _chatroomToConnectionIds.Add(chatroom, new HashSet<string>());
                }
                _chatroomToConnectionIds[chatroom].Add(connectionId);

                if (!_connectionIdToChatroom.ContainsKey(connectionId))
                {
                    _connectionIdToChatroom.Add(connectionId, chatroom);
                }
                else
                {
                    _connectionIdToChatroom[connectionId] = chatroom;
                }
            }

            if (!_connectionIdToUsername.ContainsKey(connectionId))
            {
                _connectionIdToUsername.Add(connectionId, username);
            }
            else
            {
                _connectionIdToUsername[connectionId] = username;
            }
        }

        /// <summary>
        /// Removes the specified <paramref name="connectionId"/> from all Chatrooms.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns>The list of chatrooms the <paramref name="connectionId"/> is removed from</returns>
        public IEnumerable<string> Remove(string connectionId)
        {
            var emptyChatrooms = new List<string>();

            foreach (string chatroom in _chatroomToConnectionIds.Keys)
            {
                if (_chatroomToConnectionIds[chatroom].Remove(connectionId))
                {
                    yield return chatroom;
                }

                if (!_chatroomToConnectionIds[chatroom].Any())
                {
                    emptyChatrooms.Add(chatroom);
                }
            }

            foreach (string emptyChatRoom in emptyChatrooms)
            {
                _chatroomToConnectionIds.Remove(emptyChatRoom);
            }

            _connectionIdToChatroom.Remove(connectionId);

            _connectionIdToUsername.Remove(connectionId);
        }

        /// <summary>
        /// Gets the Chatrooms that the specified <paramref name="connectionId"/> is currently in.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns></returns>
        public string GetChatroom(string connectionId)
        {
            if (!_connectionIdToChatroom.ContainsKey(connectionId))
            {
                throw new ArgumentOutOfRangeException("connectionId", "connectionId " + connectionId + " not found");
            }

            return _connectionIdToChatroom[connectionId];
        }

        public dynamic ToDynamic()
        {
            dynamic d = new ExpandoObject();

            d.Chatrooms = _chatroomToConnectionIds.Select(c =>
                                                               {
                                                                   dynamic r = new ExpandoObject();
                                                                   r.Chatroom = c.Key;
                                                                   r.Ids      = c.Value.ToArray();
                                                                   return r;
                                                               });

            d.Users = _connectionIdToChatroom.Select(c =>
                                                          {
                                                              dynamic r = new ExpandoObject();
                                                              r.Id       = c.Key;
                                                              r.Username = c.Value;
                                                              return r;
                                                          });

            return d;
        }

        private IDictionary<string, HashSet<string>> _chatroomToConnectionIds;
        private IDictionary<string, string>          _connectionIdToChatroom;
        private IDictionary<string, string>          _connectionIdToUsername;
    }
}