using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatteR.Web.Mvc
{
    /// <summary>
    /// Keeps track of all Chatrooms and Connection IDs in each Chatroom.
    /// </summary>
    public class Chatter
    {
        public Chatter()
        {
            _chatroomConnectionIds = new Dictionary<string, HashSet<string>>();
        }

        public IList<string> Chatrooms     { get { return _chatroomConnectionIds.Keys.ToList(); } }
        public IList<string> ConnectionIds { get { return _chatroomConnectionIds.Values.SelectMany(s => s).ToList(); } }

        /// <summary>
        /// Adds the specified <paramref name="connectionId"/> to the specified <paramref name="chatroom"/>.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <param name="chatroom"></param>
        public void Add(string connectionId, string chatroom)
        {
            if (!_chatroomConnectionIds.ContainsKey(chatroom))
            {
                _chatroomConnectionIds.Add(chatroom, new HashSet<string>());
            }
            _chatroomConnectionIds[chatroom].Add(connectionId);
        }

        /// <summary>
        /// Removes the specified <paramref name="connectionId"/> from all Chatrooms.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns></returns>
        public IEnumerable<string> Remove(string connectionId)
        {
            var emptyChatrooms = new List<string>();
            foreach (string chatroom in _chatroomConnectionIds.Keys)
            {
                if (_chatroomConnectionIds[chatroom].Remove(connectionId))
                {
                    yield return chatroom;
                }
                if (!_chatroomConnectionIds[chatroom].Any())
                {
                    emptyChatrooms.Add(chatroom);
                }
            }
            foreach (string emptyChatRoom in emptyChatrooms)
            {
                _chatroomConnectionIds.Remove(emptyChatRoom);
            }
        }

        /// <summary>
        /// Gets all Chatrooms that the specified <paramref name="connectionId"/> is currently in.
        /// </summary>
        /// <param name="connectionId"></param>
        /// <returns></returns>
        public IEnumerable<string> GetChatrooms(string connectionId)
        {
            foreach (string chatroom in _chatroomConnectionIds.Keys)
            {
                if (_chatroomConnectionIds[chatroom].Contains(connectionId))
                {
                    yield return chatroom;
                }
            }
        }

        private IDictionary<string, HashSet<string>> _chatroomConnectionIds;
    }
}