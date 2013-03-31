using System.Threading;
using System.Web.Configuration;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace ChatteR.Web.Mvc
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            RouteTable.Routes.MapHubs();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            timer = new Timer(ChatterHubUpdateStats, null, 1000, int.Parse(WebConfigurationManager.AppSettings["ChatterHubUpdateStatsIntervalInMilliseconds"]));
        }

        public void ChatterHubUpdateStats(object state)
        {
            ChatterHub.UpdateStats();
        }

        private Timer timer;
    }
}