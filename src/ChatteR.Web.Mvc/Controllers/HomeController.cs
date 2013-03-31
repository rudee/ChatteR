using System.Web.Mvc;
using ChatteR.Web.Mvc.ViewModels.Home;

namespace ChatteR.Web.Mvc.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index(string chatroom)
        {
            return View(new IndexViewModel { Chatroom = chatroom });
        }
    }
}