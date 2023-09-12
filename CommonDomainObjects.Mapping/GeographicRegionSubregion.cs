using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicRegionSubregion: ClassMapping<Locations.GeographicRegionSubregion>
    {
        public GeographicRegionSubregion()
        {
            Schema("Locations");
            ComposedId(
                idPropertiesMapper =>
                {
                    idPropertiesMapper.ManyToOne(regionSubregion => regionSubregion.Region   );
                    idPropertiesMapper.ManyToOne(regionSubregion => regionSubregion.Subregion);
                });
        }
    }
}
