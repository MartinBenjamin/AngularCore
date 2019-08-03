using NHibernate.Mapping.ByCode;

namespace NHibernateIntegration
{
    public interface IModelMapperFactory
    {
        ModelMapper Build();
    }
}
