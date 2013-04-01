using System.Web;
using System.Web.Optimization;

namespace ChatteR.Web.Mvc
{
    public class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/css/home/index").Include("~/css/home/index.css"));
            bundles.Add(new ScriptBundle("~/js/chatterhub").Include("~/js/chatterhub.js"));
            bundles.Add(new ScriptBundle("~/js/home/index").Include("~/js/home/index.js"));
        }
    }
}