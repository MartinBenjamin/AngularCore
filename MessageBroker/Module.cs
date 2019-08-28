using Autofac;

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
                .AsSelf()
                .InstancePerLifetimeScope();

            builder
                .RegisterType<MessageBroker>()
                .As<IMessageConsumer>()
                .As<IMessageBroker>()
                .InstancePerLifetimeScope();
        }
    }
}
