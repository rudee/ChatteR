using System.Web;
using System.Web.Configuration;
using System.Web.Optimization;

namespace ChatteR.Web.Mvc
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            
            bundles.UseCdn = true;

            bundles.Add(new StyleBundle("~/content/chatter")
                   .Include("~/content/chatter.css"));

            bundles.Add(new ScriptBundle("~/scripts/jquery",
                                         WebConfigurationManager.AppSettings["JqueryCdnUrl"])
                   .Include("~/scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/scripts/json2",
                                         WebConfigurationManager.AppSettings["Json2CdnUrl"])
                   .Include("~/scripts/json2.js"));

            bundles.Add(new ScriptBundle("~/scripts/jquery.signalR",
                                         WebConfigurationManager.AppSettings["JquerySignalRCdnUrl"])
                   .Include("~/scripts/jquery.signalR-{version}.js"));

            bundles.Add(new ScriptBundle("~/scripts/chatter")
                   .Include("~/scripts/console-fix.js",
                            "~/scripts/chatter-hub.js",
                            "~/scripts/chatter.js"));
        }
    }
}