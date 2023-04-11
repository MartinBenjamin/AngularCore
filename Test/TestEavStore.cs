using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace Test
{
    [TestFixture]
    class TestEavStore
    {
        private const string _listenerName = "TestListener";

        [SetUp]
        public void SetUp()
        {
            if(!Trace.Listeners.Cast<TraceListener>().Any(traceListener => traceListener.Name == _listenerName))
                Trace.Listeners.Add(
                    new TextWriterTraceListener(
                        TestContext.Out,
                        _listenerName));
        }

        [Test]
        public void Test()
        {
            int i = short.MaxValue;
            Assert.That(((IConvertible)i).ToUInt16(null), Is.EqualTo(short.MaxValue));
            Assert.Throws<OverflowException>(() => ((IConvertible)(short.MaxValue + 1)).ToInt16(null));
            Assert.Throws<OverflowException>(() => ((IConvertible)(short.MinValue - 1)).ToInt16(null));
        }
    }
}
