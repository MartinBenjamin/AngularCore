using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class LegalEntity: JoinedSubclassMapping<LegalEntities.LegalEntity>
    {
        public LegalEntity()
        {
            ManyToOne(
                legalEntity => legalEntity.DomiciledIn,
                manyToOneMapping => manyToOneMapping.Column(columnMapping => columnMapping.SqlType(GeographicalArea.IdSqlType)));
        }
    }
}
