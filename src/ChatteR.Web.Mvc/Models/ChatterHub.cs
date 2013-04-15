using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Configuration;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace ChatteR.Web.Mvc.Models
{
    [HubName("chatter")]
    public class ChatterHub : Hub
    {
        static ChatterHub()
        {
            s_chatter = new Chatter();
        }

        public ChatterHub()
        {
            if (s_timer == null)
            {
                s_timer = new Timer(UpdateStatus,
                                    null,
                                    1000,
                                    int.Parse(WebConfigurationManager.AppSettings["ChatterHubUpdateStatsIntervalInMilliseconds"]));
            }
        }

        public override Task OnDisconnected()
        {
            Disconnect();

            s_isStatsDirty = true;

            return base.OnDisconnected();
        }

        public void UpdateStatus(object state)
        {
            if (!s_isStatsDirty)
            {
                return;
            }

            //IEnumerable<Chatroom> chatrooms = s_chatter.Chatrooms;
            IList<Chatroom> chatrooms = s_chatter.Chatrooms.ToList();
            if (!chatrooms.Any(c => c.Name == string.Empty))
            {
                chatrooms.Add(new Chatroom(string.Empty, Enumerable.Empty<User>()));
            }
            chatrooms = chatrooms.OrderBy(c => c.Name)
                                 .Select(c => {
                                     IEnumerable<User> users = c.Users.Select(u => {
                                         string username = u.Username;
                                         if (string.IsNullOrWhiteSpace(username))
                                         {
                                             username = "Anonymous";
                                         }
                                         return new User(u.Id, username);
                                     });

                                     return new Chatroom(c.Name, users.OrderBy(u => u.Username));
                                 })
                                 .ToList();
            Version version = Assembly.GetExecutingAssembly().GetName().Version;
            
            var data = new
                           {
                               chatrooms = chatrooms,
                               date      = DateTime.UtcNow.ToString("r"),
                               version   = version.Major + "." + version.Minor + "." + version.Build
                           };

            IHubContext context = GlobalHost.ConnectionManager.GetHubContext<ChatterHub>();

            context.Clients.All.UpdateStatus(JsonConvert.SerializeObject(data,
                                                                         new JsonSerializerSettings
                                                                             {
                                                                                 ContractResolver = new CamelCasePropertyNamesContractResolver()
                                                                             }));

            s_isStatsDirty = false;
        }

        public void SendMessage(dynamic data)
        {
            string message  = data.message;
            string username = data.username;

            if (string.IsNullOrWhiteSpace(message))
            {
                return;
            }

            username = string.IsNullOrWhiteSpace(username) ? null : username.Trim();
            s_chatter.AddOrUpdate(Context.ConnectionId, username, null);

            Clients.Group(s_chatter.GetChatroom(Context.ConnectionId))
                   .ReceiveMessage(new
                                       {
                                           message   = FormatMessage(message),
                                           username  = FormatUsername(username),
                                           timestamp = DateTime.UtcNow.ToString("r")
                                       });
        }

        public void JoinChatroom(dynamic data)
        {
            Disconnect();

            string username = data.username;
            string chatroom = data.chatroom;

            username = string.IsNullOrWhiteSpace(username) ? null : username.Trim();

            chatroom = chatroom.Trim();
            Groups.Add(Context.ConnectionId, chatroom);
            s_chatter.AddOrUpdate(Context.ConnectionId,
                                  username,
                                  chatroom);
            s_isStatsDirty = true;
        }

        public void UpdateUsername(dynamic data)
        {
            string username = data.username;

            username = string.IsNullOrWhiteSpace(username) ? null : username.Trim();

            s_chatter.AddOrUpdate(Context.ConnectionId, username, null);
            s_isStatsDirty = true;
        }

        private void Disconnect()
        {
            IEnumerable<string> chatrooms = s_chatter.Remove(Context.ConnectionId);
            foreach (string chatroom in chatrooms)
            {
                Groups.Remove(Context.ConnectionId, chatroom);
            }
        }

        private static string FormatMessage(string message)
        {
            if (Regex.IsMatch(message, @"^  ", RegexOptions.Multiline))
            {
                // Wrap entire message in a <PRE> element
                return "<pre>" + WebUtility.HtmlEncode(message) + "</pre>";
            }
            else
            {
                // Replace all URLs with <A> elements
                message = WebUtility.HtmlEncode(message);
                var imageRegex = new Regex(@"\S+\.(jpg|jpeg|gif|png|apng|svg|bmp|ico)(\?|$)", RegexOptions.Singleline);
                var httpRegex = new Regex(@"^https?://\S+", RegexOptions.Multiline);
                MatchCollection httpMatches = httpRegex.Matches(message);
                foreach (Match match in httpMatches)
                {
                    if (imageRegex.IsMatch(match.Value))
                    {
                        message = message.Replace(match.Value, string.Format("<a href=\"{0}\" target=\"_blank\"><img src=\"{0}\"></a>", match.Value)); 
                    }
                    else
                    {
                        message = message.Replace(match.Value, string.Format("<a href=\"{0}\" target=\"_blank\">{0}</a>", match.Value)); 
                    }
                }
                var httpsRegex = new Regex(@" https?://\S+", RegexOptions.Multiline);
                MatchCollection httpsMatches = httpsRegex.Matches(message);
                foreach (Match match in httpsMatches)
                {
                    if (imageRegex.IsMatch(match.Value))
                    {
                        message = message.Replace(match.Value, string.Format(" <a href=\"{0}\" target=\"_blank\"><img src=\"{0}\"></a>", match.Value));
                    }
                    else
                    {
                        message = message.Replace(match.Value, string.Format(" <a href=\"{0}\" target=\"_blank\">{0}</a>", match.Value));
                    }
                }

                // Wrap each line inside a <P> element
                string[] lines = message.Split(new[] { "\r\n", "\n", "\r" }, StringSplitOptions.RemoveEmptyEntries);
                if (lines.Length > 1)
                {
                    return lines.ToList().Aggregate((current, next) => "<p>" + current + "</p>" + Environment.NewLine + "<p>" + next + "</p>");
                }
                else
                {
                    return "<p>" + lines[0] + "</p>";
                }
            }
        }

        private static string FormatUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
            {
                return "Anonymous";
            }

            return WebUtility.HtmlEncode(username.Trim());
        }

        private static readonly Chatter s_chatter;
        private static Timer s_timer;
        private static bool  s_isStatsDirty;
    }
}