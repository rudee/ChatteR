using System.Collections.Generic;
using System.Linq;

namespace ChatteR.Web.Mvc.Models
{
    public struct Chatroom
    {
        public Chatroom(string            name,
                        IEnumerable<User> users)
        {
            _name  = name;
            _users = users;
        }

        public string            Name  { get { return _name; } }
        public IEnumerable<User> Users { get { return _users; } }

        private string            _name;
        private IEnumerable<User> _users;
    }
}