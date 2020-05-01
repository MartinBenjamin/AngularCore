using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class DealType: ClassMapping<Deals.DealType>
    {
        public DealType()
        {
            Bag(
                dealType => dealType.KeyCounterparties,
                collectionMapper => collectionMapper.Table("DealTypeKeyCounterparties"),
                mapper => mapper.ManyToMany(manyToManyMapper => manyToManyMapper.Column("RoleId")));
        }
    }
}
