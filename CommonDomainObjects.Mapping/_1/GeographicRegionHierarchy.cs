using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping._1
{
    public class GeographicRegionHierarchy: ClassMapping<Locations._1.GeographicRegionHierarchy>
    {
        public GeographicRegionHierarchy()
        {
            Schema("Locations");
        }
    }
}
