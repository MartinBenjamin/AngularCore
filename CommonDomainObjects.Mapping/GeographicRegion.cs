using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicRegion: ClassMapping<Locations.GeographicRegion>
    {
        public GeographicRegion()
        {
            Schema("Locations");
            Set(
                geographicRegion => geographicRegion.Subregions,
                setPropertiesMapper =>
                {
                    setPropertiesMapper.Schema("Locations");
                    setPropertiesMapper.Table("GeographicRegionSubregion");
                    setPropertiesMapper.Key(keyMapper =>
                    {
                        keyMapper.Column("RegionId");
                        keyMapper.ForeignKey("FK_GeographicRegionSubregion_Region");
                    });
                },
                collectionElementRelation => collectionElementRelation.ManyToMany(manyToManyMapper =>
                {
                    manyToManyMapper.Column("SubregionId");
                    manyToManyMapper.ForeignKey("FK_GeographicRegionSubregion_Subregion");
                }));
            //Bag(
            //    geographicRegion => geographicRegion.Subregions,
            //    bagPropertiesMapper =>
            //    {
            //        bagPropertiesMapper.Schema("Locations");
            //        bagPropertiesMapper.Table("GeographicRegionSubregion");
            //        bagPropertiesMapper.Key(keyMapper =>
            //            {
            //                keyMapper.Column("RegionId");
            //                keyMapper.ForeignKey("FK_GeographicRegionSubregion_Region");
            //            });
            //        bagPropertiesMapper.Inverse(false);
            //    },
            //    collectionElementRelation => collectionElementRelation.ManyToMany(manyToManyMapper =>
            //        {
            //            manyToManyMapper.Column("SubregionId");
            //            manyToManyMapper.ForeignKey("FK_GeographicRegionSubregion_Subregion");
            //        }));
        }
    }
}
