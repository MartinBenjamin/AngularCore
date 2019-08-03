using log4net.Config;
using NUnit.Framework;
using System.Diagnostics;
using System.Linq;

namespace Test
{
    public abstract class Test
    {
        private const string _listenerName = "TestListener";

        [OneTimeSetUp]
        public void BaseOneTimeSetUp()
        {
            //XmlConfigurator.Configure();
        }

        [SetUp]
        public void BaseSetUp()
        {
            if(!Trace.Listeners.Cast<TraceListener>().Any(traceListener => traceListener.Name == _listenerName))
                Trace.Listeners.Add(
                    new TextWriterTraceListener(
                        TestContext.Out,
                        _listenerName));
        }
    }
}
