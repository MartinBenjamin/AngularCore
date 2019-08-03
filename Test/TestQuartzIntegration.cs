using Autofac;
using NUnit.Framework;
using Quartz;
using Quartz.Impl.Matchers;
using Quartz.Spi;
using QuartzIntegration;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Test
{
    [TestFixture]
    public class TestQuartzIntegration: Test
    {
        private IContainer _container;

        public class TestJob: IJob
        {
            public static AutoResetEvent AutoResetEvent { get; } = new AutoResetEvent(false);

            public static bool Executed { get; set; }

            Task IJob.Execute(
                IJobExecutionContext context
                )
            {
                return Task.Run(
                    () =>
                    {
                        Executed = true;
                        AutoResetEvent.Set();
                    });
            }
        }

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<QuartzIntegration.Module>();
            builder
                .RegisterType<TestJob>()
                .AsSelf()
                .InstancePerLifetimeScope();

            _container = builder.Build();
        }

        [SetUp]
        public void SetUp()
        {
            TestJob.AutoResetEvent.Reset();
            TestJob.Executed = false;
        }

        [Test]
        public void ResolveJobFactory()
        {
            var factory = _container.Resolve<IJobFactory>();
            Assert.That(factory, Is.Not.Null);
            Assert.That(factory, Is.InstanceOf<JobFactory>());
        }

        [Test]
        public void NewJob()
        {
            var jobDetail = JobBuilder
                .Create<TestJob>()
                .Build();
            var factory = _container.Resolve<IJobFactory>();
            var job = factory.NewJob(
                new TriggerFiredBundle(
                    jobDetail,
                    null,
                    null,
                    false,
                    new DateTimeOffset(),
                    null,
                    null,
                    null),
                null);
            Assert.That(job, Is.InstanceOf<JobWrapper<TestJob>>());
        }

        [Test]
        public async Task JobExecution()
        {
            Assert.That(TestJob.Executed, Is.False);

            var jobDetail = JobBuilder
                .Create<TestJob>()
                .Build();

            var trigger = TriggerBuilder.Create()
                .StartNow()
                .Build();

            var scheduler = _container.Resolve<IScheduler>();
            scheduler.ListenerManager.AddJobListener(
                _container.Resolve<IJobListener>(),
                GroupMatcher<JobKey>.AnyGroup());
            await scheduler.Start();
            await scheduler.ScheduleJob(jobDetail, trigger);

            Assert.That(await Task.Run(() => TestJob.AutoResetEvent.WaitOne(1000)), Is.True);
            Assert.That(TestJob.Executed, Is.True);

            await scheduler.Shutdown();
        }

        [OneTimeTearDown]
        public void OneTimeTearDown()
        {
            _container.Dispose();
            _container = null;
        }
    }
}
