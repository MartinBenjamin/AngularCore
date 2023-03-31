using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping._1
{
    public class GeographicSubregion: SubclassMapping<Locations._1.GeographicSubregion>
    {
        public GeographicSubregion()
        {
            Set(
                geographicSubregion => geographicSubregion.Regions,
                setPropertiesMapper =>
                {
                    setPropertiesMapper.Schema("Locations");
                    setPropertiesMapper.Table("GeographicRegionSubregion");
                    setPropertiesMapper.Key(keyMapper =>
                    {
                        keyMapper.Column("SubregionId");
                        keyMapper.ForeignKey("FK_GeographicRegionSubregion_Subregion");
                    });

                },
                collectionElementRelation => collectionElementRelation.ManyToMany(manyToManyMapper =>
                {
                    manyToManyMapper.Column("RegionId");
                    manyToManyMapper.ForeignKey("FK_GeographicRegionSubregion_Region");
                })
            );
            //Bag(
            //    geographicSubregion => geographicSubregion.Regions,
            //    bagPropertiesMapper =>
            //    {
            //        bagPropertiesMapper.Schema("Locations");
            //        bagPropertiesMapper.Table("GeographicRegionSubregion");
            //        bagPropertiesMapper.Key(keyMapper =>
            //        {
            //            keyMapper.Column("SubregionId");
            //            keyMapper.ForeignKey("FK_GeographicRegionSubregion_Subregion");
            //        });
            //        bagPropertiesMapper.Inverse(false);
            //    },
            //    collectionElementRelation => collectionElementRelation.ManyToMany(manyToManyMapper =>
            //        {
            //            manyToManyMapper.Column("RegionId");
            //            manyToManyMapper.ForeignKey("FK_GeographicRegionSubregion_Region");
            //        }));
        }
    }
}
