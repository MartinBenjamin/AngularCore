using NHibernate;

namespace NHibernateIntegration
{
    public class SessionFactoryFactory: ISessionFactoryFactory
    {
        private IConfigurationFactory _configurationFactory;

        public SessionFactoryFactory(
            IConfigurationFactory configurationFactory
            )
        {
            _configurationFactory = configurationFactory;
        }

        public ISessionFactory Build(
            string name
            )
        {
            return _configurationFactory
                .Build(name)
                .BuildSessionFactory();
        }
    }
}
