using Autofac;
using CommonDomainObjects;
using MessageBroker;
using NHibernate;
using NHibernate.Mapping.ByCode;
using NHibernate.Tool.hbm2ddl;
using NHibernateIntegration;
using NUnit.Framework;
using Quartz;
using Quartz.Impl.Matchers;
using System;
using System.Collections.Generic;
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

        public class MessageHandler: IMessageHandler
        {
            public static AutoResetEvent AutoResetEvent { get; } = new AutoResetEvent(false);

            public IList<Message> Messages { get; } = new List<Message>();

            public MessageHandler(): base()
            {
            }

            Type IMessageHandler.Type => typeof(Message);

            async Task IMessageHandler.Handle(
                IMessageBroker        broker,
                MessageBroker.Message message
                )
            {
                lock(Messages)
                {
                    Messages.Add((Message)message);

                    if(Messages.Count == _maxMessages)
                        AutoResetEvent.Set();
                }
            }
        }

        public class ModelMapperFactory: CommonDomainObjects.Mapping.ConventionModelMapperFactory
        {
            protected override void Populate(
                ConventionModelMapper mapper
                )
            {
                base.Populate(mapper);

                mapper.Class<Message>(
                    messaageMapper =>
                    {
                        messaageMapper.Table("Message");
                    });

                mapper.Class<MessageQueue>(
                    messaageQueueMapper =>
                    {
                        messaageQueueMapper.Table("MessageQueue");
                        messaageQueueMapper.Id(
                            messageQueue => messageQueue.Id,
                            idMapper     => idMapper.Generator(Generators.Assigned));
                    });
            }
        }

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            var builder = new ContainerBuilder();
            builder
                .RegisterModule<Log4NetIntegration.Module>();
            builder
                .RegisterModule<NHibernateIntegration.Module>();
            builder
                .RegisterType<ModelMapperFactory>()
                .As<IModelMapperFactory>()
                .SingleInstance();
            builder
                .RegisterType<LocalDbConfigurationFactory>()
                .As<IConfigurationFactory>()
                .SingleInstance();
            builder
                .RegisterModule(new SessionFactoryModule("Test"));
            builder
                .RegisterModule<QuartzIntegration.Module>();
            builder
                .RegisterModule<MessageBroker.Module>();
            builder
                .RegisterType<MessageHandler>()
                .AsSelf()
                .As<IMessageHandler>()
                .SingleInstance();

            _container = builder.Build();

            var schemaExport = new SchemaExport(_container.Resolve<IConfigurationFactory>().Build("Test"));
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
            var messageHandler = _container.Resolve<MessageHandler>();
            Assert.That(messageHandler.Messages.Count, Is.EqualTo(0));
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                await session.SaveAsync(messageQueue);
                await messages.Dispatch(message => session.SaveAsync(message), 10);
                await session.FlushAsync();
            }

            var jobDetail = JobBuilder
                .Create<MessagePump>()
                .Build();

            jobDetail.JobDataMap["QueueIds"] = new[] { MessageQueueIdentifier.MessageBroker };

            var trigger = TriggerBuilder.Create()
                .StartNow()
                .Build();

            var scheduler = _container.Resolve<IScheduler>();
            scheduler.ListenerManager.AddJobListener(
                _container.Resolve<IJobListener>(),
                GroupMatcher<JobKey>.AnyGroup());
            await scheduler.Start();
            await scheduler.ScheduleJob(jobDetail, trigger);

            Assert.That(await Task.Run(() => MessageHandler.AutoResetEvent.WaitOne(1000)), Is.True);

            Assert.That(
                messageHandler.Messages.OrderBy(message => message.Id).SequenceEqual(
                    messages.OrderBy(message => message.Id)), Is.True);

            await scheduler.Shutdown();
        }
    }
}
