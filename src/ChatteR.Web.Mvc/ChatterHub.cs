using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using Newtonsoft.Json;

namespace ChatteR.Web.Mvc
{
    [HubName("chatter")]
    public class ChatterHub : Hub
    {
        public static void UpdateStats()
        {
            var data = new
            {
                numOfClients   = s_chatter.ConnectionIds.Count,
                numOfChatrooms = s_chatter.Chatrooms.Count,
                date           = DateTime.UtcNow.ToString("r")
            };

            IHubContext context = GlobalHost.ConnectionManager.GetHubContext<ChatterHub>();
            string      json    = JsonConvert.SerializeObject(data);

            context.Clients.All.UpdateStats(json);
        }

        static ChatterHub()
        {
            s_chatter = new Chatter();
        }

        public override Task OnDisconnected()
        {
            IEnumerable<string> chatrooms = s_chatter.Remove(Context.ConnectionId);
            foreach (string chatroom in chatrooms)
            {
                Groups.Remove(Context.ConnectionId, chatroom);
            }

            return base.OnDisconnected();
        }

        public void SendMessage(string message, string signature)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return;
            }

            message = FormatMessage(message);
            signature = FormatSignature(signature);

            s_chatter.GetChatrooms(Context.ConnectionId).ToList().ForEach(
                chatroom => Clients.Group(chatroom).ReceiveMessage(message, signature));
        }

        public void JoinChatroom(string chatroom)
        {
            chatroom = chatroom.Trim();
            Groups.Add(Context.ConnectionId, chatroom);
            s_chatter.Add(Context.ConnectionId, chatroom);
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
                var regex1 = new Regex(@"^https?://\S+", RegexOptions.Multiline);
                MatchCollection matches1 = regex1.Matches(message);
                foreach (Match match in matches1)
                {
                    message = message.Replace(match.Value, string.Format("<a href=\"{0}\" target=\"_blank\">{0}</a>", match.Value));
                }
                var regex2 = new Regex(@" https?://\S+", RegexOptions.Multiline);
                MatchCollection matches2 = regex2.Matches(message);
                foreach (Match match in matches2)
                {
                    message = message.Replace(match.Value, string.Format(" <a href=\"{0}\" target=\"_blank\">{0}</a>", match.Value));
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

        private static string FormatSignature(string signature)
        {
            if (string.IsNullOrWhiteSpace(signature))
            {
                return "Anonymous";
            }

            return WebUtility.HtmlEncode(signature.Trim());
        }

        private static readonly Chatter s_chatter;
    }
}