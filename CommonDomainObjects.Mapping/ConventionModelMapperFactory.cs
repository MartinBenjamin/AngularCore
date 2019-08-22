using NHibernate.Mapping.ByCode;
using System;

namespace CommonDomainObjects.Mapping
{
    public class ConventionModelMapperFactory: NHibernateIntegration.ConventionModelMapperFactory
    {
        protected override void Populate(
            ConventionModelMapper mapper
            )
        {
            base.Populate(mapper);

            mapper.IsEntity((
                Type type,
                bool declared
                ) => IsDomainObject<Guid>(type) || IsDomainObject<string>(type));

            mapper.Class<DomainObject<Guid>>(
                classMapper => classMapper.Id(
                    domainObject => domainObject.Id,
                    idMapper => idMapper.Generator(Generators.Guid)));


            mapper.Class<GeographicalArea>(
                geographicalAreaMapper =>
                {
                    geographicalAreaMapper.Id(
                        geographicalArea => geographicalArea.Id,
                        idMapper => idMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(2)")));

                    geographicalAreaMapper.ManyToOne(
                        geographicalArea => geographicalArea.Parent,
                        manyToOneMapper => manyToOneMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(2)")));

                    geographicalAreaMapper.Bag(
                        geographicalArea => geographicalArea.Children,
                        collectionMapper => collectionMapper.Key(
                            keyMapper => keyMapper.Column("ParentId")));
                });

            mapper.JoinedSubclass<Country>(
                countryMapper =>
                {
                    countryMapper.Key(
                        keyMapper =>
                        {
                            keyMapper.Column(
                                columnMapper =>
                                {
                                    columnMapper.Name("Alpha2Code");
                                    columnMapper.SqlType("NCHAR(2)");
                                });

                            keyMapper.ForeignKey("FK_" + nameof(GeographicalArea));
                        });

                    countryMapper.Property(
                        country => country.Alpha2Code,
                        propertyMapper =>
                        {
                            propertyMapper.Insert(false);
                            propertyMapper.Update(false);
                        });

                    countryMapper.Property(
                        country => country.Alpha3Code,
                        propertyMapper =>
                        {
                            propertyMapper.Column(columnMapper => columnMapper.SqlType("NCHAR(3)"));
                            propertyMapper.Unique(true);
                            propertyMapper.NotNullable(true);
                        });

                    countryMapper.Property(
                        country => country.Alpha4Code,
                        propertyMapper => propertyMapper.Column(
                            columnMapper => columnMapper.SqlType("NCHAR(4)")));

                    countryMapper.Property(
                        country => country.NumericCode,
                        propertyMapper =>
                        {
                            propertyMapper.Unique(true);
                            propertyMapper.NotNullable(true);
                        });
                });
        }

        private static bool IsDomainObject<TId>(
            Type type
            )
        {
            return type != typeof(DomainObject<TId>) && typeof(DomainObject<TId>).IsAssignableFrom(type);
        }
    }
}
