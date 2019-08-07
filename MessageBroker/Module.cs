using Autofac;
using Quartz;

namespace MessageBroker
{
    public class Module: Autofac.Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterType<MessagePump>()
                .As<IJob>()
                .InstancePerLifetimeScope();

            builder
                .RegisterType<MessageBroker>()
                .As<IMessageConsumer>()
                .As<IMessageBroker>()
                .InstancePerLifetimeScope();
        }
    }
}
