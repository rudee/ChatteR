using System.Web;
using System.Web.Optimization;

namespace ChatteR.Web.Mvc
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/css/home/index")
                   .Include("~/css/home/index.css"));
            bundles.Add(new ScriptBundle("~/js/chatter")
                   .Include("~/js/console-fix.js", 
                            "~/js/chatter.js",
                            "~/js/home/index.js"));
        }
    }
}