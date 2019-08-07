using log4net;
using log4net.Config;
using NUnit.Framework;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Test
{
    public abstract class Test
    {
        private const string _listenerName = "TestListener";

        [OneTimeSetUp]
        public void BaseOneTimeSetUp()
        {
            //XmlConfigurator.Configure();
            var repository = LogManager.GetRepository(Assembly.GetEntryAssembly());
            XmlConfigurator.Configure(
                repository,
                new FileInfo(@"Log4Net.config"));
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
