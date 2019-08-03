using CommonDomainObjects;
using NUnit.Framework;

namespace Test
{

    internal class A
    { }

    internal class B
    { }

    internal class C
    { }

    internal class D
    { }

    [TestFixture(typeof(A), typeof(B))]
    public class TestUnion<T1, T2>
        where T1: new()
        where T2: new()
    {
        [Test]
        public void TestT1()
        {
            var value = new T1();
            var u = new Union<T1, T2>(value);
            u.Switch(
                t1 => Assert.That(t1, Is.EqualTo(value)),
                t2 => Assert.Fail(),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T1>(
                    t1 => t1,
                    t2 => default(T1),
                    () => default(T1)),
                Is.EqualTo(value));

            Union<T1, T2> u1 = value;
            u1.Switch(
                t1 => Assert.That(t1, Is.EqualTo(value)),
                t2 => Assert.Fail(),
                () => Assert.Fail());
        }

        [Test]
        public void TestT2()
        {
            var value = new T2();
            var u = new Union<T1, T2>(value);
            u.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.That(t2, Is.EqualTo(value)),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T2>(
                    t1 => default(T2),
                    t2 => t2,
                    () => default(T2)),
                Is.EqualTo(value));

            Union<T1, T2> u1 = value;
            u1.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.That(t2, Is.EqualTo(value)),
                () => Assert.Fail());
        }
    }

    [TestFixture(typeof(A), typeof(B), typeof(C))]
    public class TestUnion<T1, T2, T3>
        where T1: new()
        where T2: new()
        where T3: new()
    {
        [Test]
        public void TestT1()
        {
            var value = new T1();
            var u = new Union<T1, T2, T3>(value);
            u.Switch(
                t1 => Assert.That(t1, Is.EqualTo(value)),
                t2 => Assert.Fail(),
                t3 => Assert.Fail(),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T1>(
                    t1 => t1,
                    t2 => default(T1),
                    t3 => default(T1),
                    () => default(T1)),
                Is.EqualTo(value));

            Union<T1, T2, T3> u1 = value;
            u1.Switch(
                t1 => Assert.That(t1, Is.EqualTo(value)),
                t2 => Assert.Fail(),
                t3 => Assert.Fail(),
                () => Assert.Fail());
        }

        [Test]
        public void TestT2()
        {
            var value = new T2();
            var u = new Union<T1, T2, T3>(value);
            u.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.That(t2, Is.EqualTo(value)),
                t3 => Assert.Fail(),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T2>(
                    t1 => default(T2),
                    t2 => t2,
                    t3 => default(T2),
                    () => default(T2)),
                Is.EqualTo(value));

            Union<T1, T2, T3> u1 = value;
            u1.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.That(t2, Is.EqualTo(value)),
                t3 => Assert.Fail(),
                () => Assert.Fail());
        }

        [Test]
        public void TestT3()
        {
            var value = new T3();
            var u = new Union<T1, T2, T3>(value);
            u.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.Fail(),
                t3 => Assert.That(t3, Is.EqualTo(value)),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T3>(
                    t1 => default(T3),
                    t2 => default(T3),
                    t3 => t3,
                    () => default(T3)),
                Is.EqualTo(value));

            Union<T1, T2, T3> u1 = value;
            u1.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.Fail(),
                t3 => Assert.That(t3, Is.EqualTo(value)),
                () => Assert.Fail());
        }
    }

    [TestFixture(typeof(A), typeof(B), typeof(C), typeof(D))]
    public class TestUnion<T1, T2, T3, T4>
        where T1: new()
        where T2: new()
        where T3: new()
        where T4: new()
    {
        [Test]
        public void TestT1()
        {
            var value = new T1();
            var u = new Union<T1, T2, T3, T4>(value);
            u.Switch(
                t1 => Assert.That(t1, Is.EqualTo(value)),
                t2 => Assert.Fail(),
                t3 => Assert.Fail(),
                t4 => Assert.Fail(),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T1>(
                    t1 => t1,
                    t2 => default(T1),
                    t3 => default(T1),
                    t4 => default(T1),
                    () => default(T1)),
                Is.EqualTo(value));

            Union<T1, T2, T3, T4> u1 = value;
            u1.Switch(
                t1 => Assert.That(t1, Is.EqualTo(value)),
                t2 => Assert.Fail(),
                t3 => Assert.Fail(),
                t4 => Assert.Fail(),
                () => Assert.Fail());
        }

        [Test]
        public void TestT2()
        {
            var value = new T2();
            var u = new Union<T1, T2, T3, T4>(value);
            u.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.That(t2, Is.EqualTo(value)),
                t3 => Assert.Fail(),
                t4 => Assert.Fail(),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T2>(
                    t1 => default(T2),
                    t2 => t2,
                    t3 => default(T2),
                    t4 => default(T2),
                    () => default(T2)),
                Is.EqualTo(value));

            Union<T1, T2, T3, T4> u1 = value;
            u1.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.That(t2, Is.EqualTo(value)),
                t3 => Assert.Fail(),
                t4 => Assert.Fail(),
                () => Assert.Fail());
        }

        [Test]
        public void TestT3()
        {
            var value = new T3();
            var u = new Union<T1, T2, T3, T4>(value);
            u.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.Fail(),
                t3 => Assert.That(t3, Is.EqualTo(value)),
                t4 => Assert.Fail(),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T3>(
                    t1 => default(T3),
                    t2 => default(T3),
                    t3 => t3,
                    t4 => default(T3),
                    () => default(T3)),
                Is.EqualTo(value));

            Union<T1, T2, T3, T4> u1 = value;
            u1.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.Fail(),
                t3 => Assert.That(t3, Is.EqualTo(value)),
                t4 => Assert.Fail(),
                () => Assert.Fail());
        }

        [Test]
        public void TestT4()
        {
            var value = new T4();
            var u = new Union<T1, T2, T3, T4>(value);
            u.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.Fail(),
                t3 => Assert.Fail(),
                t4 => Assert.That(t4, Is.EqualTo(value)),
                () => Assert.Fail());


            Assert.That(value, Is.Not.EqualTo(default(T1)));
            Assert.That(
                u.Switch<T4>(
                    t1 => default(T4),
                    t2 => default(T4),
                    t3 => default(T4),
                    t4 => t4,
                    () => default(T4)),
                Is.EqualTo(value));

            Union<T1, T2, T3, T4> u1 = value;
            u1.Switch(
                t1 => Assert.Fail(),
                t2 => Assert.Fail(),
                t3 => Assert.Fail(),
                t4 => Assert.That(t4, Is.EqualTo(value)),
                () => Assert.Fail());
        }
    }
}
