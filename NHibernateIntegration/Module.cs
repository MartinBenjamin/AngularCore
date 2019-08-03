using Autofac;

namespace NHibernateIntegration
{
    public class Module: Autofac.Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterType<SessionFactoryFactory>()
                .As<ISessionFactoryFactory>()
                .SingleInstance();
        }
    }
}
