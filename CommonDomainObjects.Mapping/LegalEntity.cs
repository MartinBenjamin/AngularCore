using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class LegalEntity: JoinedSubclassMapping<LegalEntities.LegalEntity>
    {
        public LegalEntity()
        {
            ManyToOne(
                legalEntity => legalEntity.Country,
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicRegion.IdSqlType)));
        }
    }
}
