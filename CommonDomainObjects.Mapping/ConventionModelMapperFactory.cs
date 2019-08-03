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
                    idMapping => idMapping.Generator(Generators.Guid)));


            mapper.Class<GeographicalArea>(
                geographicalAreaMapper =>
                    geographicalAreaMapper.Bag(
                        geographicalArea => geographicalArea.Children,
                        collectionMapping => collectionMapping.Key(
                            keyMapping => keyMapping.Column("ParentId"))));

            mapper.JoinedSubclass<Country>(
                countryMapper =>
                {
                    countryMapper.Key(
                        keyMapper =>
                        {
                            keyMapper.Column("Alpha2Code");
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
                        propertyMapper => propertyMapper.Unique(true));

                    countryMapper.Property(
                        country => country.NumericCode,
                        propertyMapper => propertyMapper.Unique(true));
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
