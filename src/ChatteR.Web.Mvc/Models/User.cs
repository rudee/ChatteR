namespace ChatteR.Web.Mvc.Models
{
    public struct User
    {
        public User(string id,
                    string username)
        {
            _id       = id;
            _username = username;
        }

        public string Id       { get { return _id;       } }
        public string Username { get { return _username; } }

        private string _id;
        private string _username;
    }
}