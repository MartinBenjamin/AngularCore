using Autofac;
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
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Test
{
    [TestFixture]
    public class TestMessageBroker: Test
    {
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

        public class MessageHandler: MessageBroker.IMessageHandler
        {
            public IList<Message> Messages { get; private set; }

            public MessageHandler(): base()
            {
                Messages = new List<Message>();
            }

            Type IMessageHandler.Type => typeof(Message);

            async Task IMessageHandler.Handle(
                IMessageBroker        broker,
                MessageBroker.Message message
                )
            {
                Messages.Add((Message)message);
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
                .RegisterType<ConfigurationFactory>()
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

            File.Delete(ConfigurationFactory.DatabasePath);
            var schemaUpdate = new SchemaUpdate(_container.Resolve<IConfigurationFactory>().Build("Test"));
            schemaUpdate.Execute(
                scriptAction => { },
                true);
        }

        [Test]
        [Explicit] // SQLite does not IsolationLevel.RepeatableRead used by the MessageBroker.
        public async Task Run()
        {
            var messages = Enumerable.Range(0, 10).Select(i => new Message(Guid.NewGuid())).ToList();
            var messageHandler = _container.Resolve<MessageHandler>();
            Assert.That(messageHandler.Messages.Count, Is.EqualTo(0));
            using(var scope = _container.BeginLifetimeScope())
            {
                var session = scope.Resolve<ISession>();
                foreach(var message in messages)
                    await session.SaveAsync(message);
                await session.FlushAsync();
            }

            var jobDetail = JobBuilder
                .Create<MessagePump>()
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

            await Task.Delay(1000);

            Assert.That(
                messageHandler.Messages.OrderBy(message => message.Id).SequenceEqual(
                    messages.OrderBy(message => message.Id)), Is.True);

            await scheduler.Shutdown();
        }
    }
}
