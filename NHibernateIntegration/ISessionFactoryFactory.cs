using NHibernate;

namespace NHibernateIntegration
{
    public interface ISessionFactoryFactory
    {
        ISessionFactory Build(string name);
    }
}
