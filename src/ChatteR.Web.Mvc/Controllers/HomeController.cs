using System.Text.RegularExpressions;
using System.Web.Mvc;
using ChatteR.Web.Mvc.ViewModels.Home;

namespace ChatteR.Web.Mvc.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(string chatroom)
        {
            chatroom = chatroom ?? "";
            string finalChatroomVal = chatroom.ToLowerInvariant();

            var r = new Regex("[^a-z0-9]");
            finalChatroomVal = r.Replace(finalChatroomVal, string.Empty);

            if (finalChatroomVal != chatroom)
            {
                return Redirect("~/" + finalChatroomVal);
            }

            return View(new IndexViewModel
                            {
                                Chatroom = finalChatroomVal
                            });
        }
    }
}