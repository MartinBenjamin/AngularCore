using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class GeographicSubregion2: SubclassMapping<Locations2.GeographicSubregion>
    {
        public GeographicSubregion2()
        {
            Set(
                geographicSubregion => geographicSubregion.Regions,
                setPropertiesMapper =>
                {
                    //setPropertiesMapper.Schema("Locations");
                    setPropertiesMapper.Table("GeographicRegionSubregion_1");
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
