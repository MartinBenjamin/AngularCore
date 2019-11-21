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

            mapper.AddMapping<GeographicalArea               >();
            mapper.AddMapping<GeographicalSubArea            >();
            mapper.AddMapping<GeographicalAreaHierarchy      >();
            mapper.AddMapping<GeographicalAreaHierarchyMember>();
            mapper.AddMapping<CountryJoin                    >();
            mapper.AddMapping<SubdivisionJoin                >();
            mapper.AddMapping<Currency                       >();
            mapper.AddMapping<Global                         >();
            mapper.AddMapping<Region                         >();
            mapper.AddMapping<SubRegion                      >();
            mapper.AddMapping<IntermediateRegion             >();
            mapper.AddMapping<AutonomousAgent                >();
            mapper.AddMapping<Organisation                   >();
            mapper.AddMapping<OrganisationalSubUnit          >();
        }

        private static bool IsDomainObject<TId>(
            Type type
            )
        {
            return type != typeof(DomainObject<TId>) && typeof(DomainObject<TId>).IsAssignableFrom(type);
        }
    }
}
