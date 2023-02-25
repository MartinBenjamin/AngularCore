using NHibernate.Cfg.MappingSchema;

namespace NHibernateIntegration
{
    public interface IMappingFactory
    {
        HbmMapping Build();
    }
}
