using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class Subdivision: JoinedSubclassMapping<Iso3166._2.Subdivision>
    {
        public Subdivision()
        {
            Key(
                keyMapper =>
                {
                    keyMapper.Column(
                        columnMapper =>
                        {
                            columnMapper.Name("Code");
                            columnMapper.SqlType(GeographicalArea.IdSqlType);
                        });

                    keyMapper.ForeignKey("FK_" + nameof(Subdivision) + nameof(GeographicalArea));
                });

            Property(
                subdivision => subdivision.Code,
                propertyMapper =>
                {
                    propertyMapper.Insert(false);
                    propertyMapper.Update(false);
                });

            ManyToOne(
                subdivision => subdivision.Country,
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicalArea.IdSqlType)));

            ManyToOne(
                subdivision => subdivision.ParentSubdivision,
                manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType(GeographicalArea.IdSqlType)));

        }
    }
}
