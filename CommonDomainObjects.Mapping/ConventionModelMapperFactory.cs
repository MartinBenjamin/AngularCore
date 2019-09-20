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

            mapper.AddMapping<GeographicalArea               >();
            mapper.AddMapping<GeographicalSubArea            >();
            mapper.AddMapping<GeographicalAreaHierarchy      >();
            mapper.AddMapping<GeographicalAreaHierarchyMember>();
            mapper.AddMapping<CountryJoin                    >();
            mapper.AddMapping<SubdivisionJoin                >();
            mapper.AddMapping<Currency                       >();
            mapper.AddMapping<Global                         >();
        }

        private static bool IsDomainObject<TId>(
            Type type
            )
        {
            return type != typeof(DomainObject<TId>) && typeof(DomainObject<TId>).IsAssignableFrom(type);
        }
    }
}
