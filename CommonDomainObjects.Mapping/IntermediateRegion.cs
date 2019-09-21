using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    class IntermediateRegion: SubclassMapping<UnsdM49.IntermediateRegion>
    {
        public IntermediateRegion()
        {
            DiscriminatorValue(nameof(UnsdM49.IntermediateRegion));
        }
    }
}
