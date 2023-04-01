using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping._1
{
    public class SubdivisionJoin: SubclassMapping<Iso3166._2._1.Subdivision>
    {
        public SubdivisionJoin()
        {
            Join(
                "Subdivision",
                joinMapper =>
                {
                    joinMapper.Schema("Iso3166_2");
                    joinMapper.Key(
                        keyMapper =>
                        {
                            keyMapper.Column(columnMapper => columnMapper.Name("Id"));
                            keyMapper.ForeignKey("FK_" + nameof(Subdivision) + "_" + nameof(GeographicRegion));
                        });

                    joinMapper.Property(
                        subdivision => subdivision.Id,
                        propertyMapper =>
                        {
                            propertyMapper.Insert(false);
                            propertyMapper.Update(false);
                        });

                    joinMapper.Property(
                        subdivision => subdivision.Code,
                        propertyMapper => propertyMapper.Unique(true));

                    joinMapper.ManyToOne(
                        subdivision => subdivision.Country);

                    joinMapper.ManyToOne(
                        subdivision => subdivision.ParentSubdivision);

                    joinMapper.Property(
                        subdivision => subdivision.Category);
                });
        }
    }
}
