using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicRegionHierarchy: ClassMapping<Locations.GeographicRegionHierarchy>
    {
        public GeographicRegionHierarchy()
        {
            Schema("Locations");
        }
    }
}
