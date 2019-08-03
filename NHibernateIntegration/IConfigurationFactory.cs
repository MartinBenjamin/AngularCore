using NHibernate.Cfg;

namespace NHibernateIntegration
{
    public interface IConfigurationFactory
    {
        Configuration Build(string name);
    }
}
