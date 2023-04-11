using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace Test
{
    using EavStore;

    [TestFixture]
    class TestEavStore
    {
        private const string _listenerName = "TestListener";
        public static bool IsBoxed<T>(T item)
        {
            TestContext.WriteLine("A");
            return (item != null) && (default(T) == null) && item.GetType().IsValueType;
        }

        public static bool IsBoxed<T>(T? item) where T : struct
        {
            TestContext.WriteLine("Struct");
            return false;
        }

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

            var w = 20;
            var x = (IConvertible)w;
            var y = new IConvertible[] { w };
            object z = x;

            TestContext.WriteLine(IsBoxed(w));
            TestContext.WriteLine(IsBoxed(x));
            TestContext.WriteLine(IsBoxed(y[0]));
            TestContext.WriteLine(IsBoxed(z));
            TestContext.WriteLine(IsBoxed(TypeCode.Int32));
            TestContext.WriteLine(IsBoxed((int)TypeCode.Int32));
            Assert.That(IsBoxed((int)TypeCode.Int32), Is.False);

            short a = 10;
            Value b = a;
        }

        [Test]
        public void TestComparer()
        {
            Value a = 1;
            Value b = 2;

            Assert.IsInstanceOf<Int32>(a);
            Assert.IsInstanceOf<Int32>(b);

            IComparer<IConvertible> comparer = new Comparer();
            Assert.That(comparer.Compare(a, a), Is.EqualTo(0));
            Assert.That(comparer.Compare(b, b), Is.EqualTo(0));
            Assert.That(comparer.Compare(a, b), Is.LessThan(0));
            Assert.That(comparer.Compare(b, a), Is.GreaterThan(0));
        }



        [Test]
        public void TestComparer2()
        {
            Value a = 1;
            Value b = (sbyte)2;

            Assert.IsInstanceOf<Int32>(a);
            Assert.IsInstanceOf<SByte>(b);

            IComparer<IConvertible> comparer = new Comparer();
            Assert.That(comparer.Compare(a, a), Is.EqualTo(0));
            Assert.That(comparer.Compare(b, b), Is.EqualTo(0));
            Assert.That(comparer.Compare(a, b), Is.LessThan(0));
            Assert.That(comparer.Compare(b, a), Is.GreaterThan(0));
        }

        [Test]
        public void Performance()
        {
            var numbers = Enumerable.Range(0, 1000).ToArray();
            var stopwatch = new Stopwatch();
            stopwatch.Start();
            for(var index1 = 0;index1 < numbers.Length;++index1)
                for(var index2 = 0;index2 < numbers.Length;++index2)
                    numbers[index1].CompareTo(numbers[index2]);
            stopwatch.Stop();
            TestContext.WriteLine(stopwatch.ElapsedTicks);
            TestContext.WriteLine(stopwatch.ElapsedMilliseconds);

            IComparer<IConvertible> comparer = new Comparer();
            var values = Enumerable.Range(0, 1000).Select(i => (Value)i).ToArray();
            stopwatch.Reset();
            stopwatch.Start();
            for(var index1 = 0;index1 < numbers.Length;++index1)
                for(var index2 = 0;index2 < numbers.Length;++index2)
                    comparer.Compare(values[index1], values[index2]);
            stopwatch.Stop();
            TestContext.WriteLine(stopwatch.ElapsedTicks);
            TestContext.WriteLine(stopwatch.ElapsedMilliseconds);
        }

        [Test]
        public void TestStore()
        {
            IStore s = null;
            //s.Assert(5L, "Attribute", 2);
        }
    }
}
