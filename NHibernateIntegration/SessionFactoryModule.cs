using Autofac;
using NHibernate;

namespace NHibernateIntegration
{
    public class SessionFactoryModule: Autofac.Module
    {
        private string _name;

        public SessionFactoryModule(
            string name
            )
        {
            _name = name;
        }

        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .Register(c => c.Resolve<ISessionFactoryFactory>().Build(_name))
                .Named<ISessionFactory>(_name)
                .As<ISessionFactory>()
                .PreserveExistingDefaults()
                .SingleInstance();

            builder
                .Register(c => c.ResolveNamed<ISessionFactory>(_name).OpenSession())
                .Named<ISession>(_name)
                .As<ISession>()
                .PreserveExistingDefaults()
                .InstancePerLifetimeScope();
        }
    }
}
