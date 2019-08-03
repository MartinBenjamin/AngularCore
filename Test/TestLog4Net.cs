using log4net;
using NUnit.Framework;

namespace Test
{
    [TestFixture]
    public class TestLog4Net: Test
    {
        [Test]
        public void Log()
        {
            LogManager.GetLogger(GetType()).Info("Test");
        }
    }
}
