using Autofac;
using CommonDomainObjects;
using MessageBroker;
using Moq;
using NHibernate;
using NHibernate.Mapping.ByCode;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Quartz;
using Quartz.Impl.Matchers;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Test
{
    [TestFixture]
    public class TestMessageBroker: Test
    {
        private static readonly int _maxMessages = 10;

        private IContainer _container;

        public class Message: MessageBroker.Message
        {
            public Message(): base()
            {
            }

            public Message(
                Guid id
                ): base(id)
            {
            }
        }

        private ContainerBuilder Builder()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<Log4NetIntegration.Module>();
            builder
                .RegisterModule<CommonDomainObjects.Mapping.Module>();
            builder
                .Register<Action<ConventionModelMapper>>(
                    c => mapper =>
                    {
                        mapper.Class<Message>(messageMapper => messageMapper.Table("Message"));

                        mapper.Class<MessageQueue>(
                            messageQueueMapper => messageQueueMapper.Id(
                                    messageQueue => messageQueue.Id,
                                    idMapper => idMapper.Generator(Generators.Assigned)));

                        mapper.Class<MessageSummary>(
                            messageSummaryMapper =>
                            {
                                messageSummaryMapper.Table("Message");
                                messageSummaryMapper.SchemaAction(SchemaAction.None);
                            });
                    });
            builder
                .RegisterType<MappingFactory>()
                .As<IMappingFactory>()
                .WithParameter(
                    "types",
                    new[]
                    {
                        typeof(Message       ),
                        typeof(MessageQueue  ),
                        typeof(MessageSummary)
                    });
            builder
                .RegisterModule(new LocalDbModule("Test"));
            return builder;
        }

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            _container = Builder().Build();

            var schemaExport = new SchemaExport(_container.Resolve<IConfigurationFactory>().Build());
            schemaExport.Create(
                scriptAction => { },
                true);
        }

        [SetUp]
        public void SetUp()
        {
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                var messageQueue = session.Get<MessageQueue>(MessageQueueIdentifier.MessageBroker);
                if(messageQueue != null)
                    session.Delete(messageQueue);

                session.Flush();
            }
        }

        [Test]
        public async Task Run()
        {
            var messageQueue = new MessageQueue(MessageQueueIdentifier.MessageBroker);
            var messages = Enumerable.Range(0, _maxMessages).Select(i => new Message(Guid.NewGuid())).ToList();
            messages.ForEach(message => message.Queue = messageQueue);

            var autoResetEvent = new AutoResetEvent(false);
            var handledMessages = new List<Message>();

            var mock = new Mock<IMessageHandler>();
            mock.Setup(messageHandler => messageHandler.Type)
                .Returns(typeof(Message));
            mock.Setup(messageHandler => messageHandler.Handle(
                    It.IsAny<IMessageBroker>(),
                    It.IsAny<MessageBroker.Message>()))
                .Callback<IMessageBroker, MessageBroker.Message>(
                    (broker, message) =>
                    {
                        lock(handledMessages)
                        {
                            handledMessages.Add((Message)message);

                            if(handledMessages.Count == _maxMessages)
                                autoResetEvent.Set();
                        }
                    });

            var builder = Builder();
            builder
                .RegisterModule<QuartzIntegration.Module>();
            builder
                .RegisterModule<MessageBroker.Module>();
            builder
                .RegisterInstance(mock.Object)
                .As<IMessageHandler>();

            var container = builder.Build();

            using(var scope = container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                await session.SaveAsync(messageQueue);
                await messages.ForEachAsync(message => session.SaveAsync(message), 10);
                await session.FlushAsync();
            }

            var jobDetail = JobBuilder
                .Create<MessagePump>()
                .Build();

            jobDetail.JobDataMap["QueueIds"] = new[] { MessageQueueIdentifier.MessageBroker };

            var trigger = TriggerBuilder.Create()
                .StartNow()
                .Build();

            var scheduler = container.Resolve<IScheduler>();
            scheduler.ListenerManager.AddJobListener(
                container.Resolve<IJobListener>(),
                GroupMatcher<JobKey>.AnyGroup());
            await scheduler.Start();
            await scheduler.ScheduleJob(jobDetail, trigger);

            Assert.That(await Task.Run(() => autoResetEvent.WaitOne(1000)), Is.True);

            using(var scope = container.BeginLifetimeScope())
            {
                var session = container.Resolve<ISession>();
                using(session.BeginTransaction(IsolationLevel.RepeatableRead))
                    Assert.That(await session
                        .CreateCriteria<Message>()
                        .SetLockMode(LockMode.Upgrade)
                        .ListAsync<Message>(), Is.Empty);
            }

            Assert.That(
                handledMessages.OrderBy(message => message.Id).SequenceEqual(
                    messages.OrderBy(message => message.Id)), Is.True);

            await scheduler.Shutdown();
        }
    }
}
