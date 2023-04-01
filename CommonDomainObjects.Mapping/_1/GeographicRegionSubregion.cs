using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping._1
{
    public class GeographicRegionSubregion: ClassMapping<Locations._1.GeographicRegionSubregion>
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
