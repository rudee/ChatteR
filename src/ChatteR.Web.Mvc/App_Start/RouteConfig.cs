using System.Web.Mvc;
using System.Web.Routing;

namespace ChatteR.Web.Mvc
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                name: "Chatroom",
                url: "{chatroom}",
                defaults: new { controller = "Home", action = "Index" }
            );

            routes.MapRoute(
                name: "DefaultChatroom",
                url: "{*url}",
                defaults: new { controller = "Home", action = "Index" }
            );
        }
    }
}