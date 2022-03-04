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
                ) => IsDomainObject<Guid>(type)
                    || IsDomainObject<string>(type)
                    || typeof(Identifiers.Identifier).IsAssignableFrom(type));

            mapper.BeforeMapJoinedSubclass += (
                IModelInspector                 modelInspector,
                Type                            type,
                IJoinedSubclassAttributesMapper joinedSubclassMapper
                ) =>
            {
                if(typeof(DomainObject<Guid>).IsAssignableFrom(type))
                    joinedSubclassMapper.Key(
                        keyMapper =>
                        {
                            keyMapper.Column(columnMapper => columnMapper.Name("Id"));

                            keyMapper.ForeignKey("FK_" + type.Name + "_Id");
                        });
            };

            mapper.AddMapping<GeographicRegion               >();
            mapper.AddMapping<GeographicRegionIdentifier     >();
            mapper.AddMapping<GeographicSubregion            >();
            mapper.AddMapping<GeographicRegionHierarchy      >();
            mapper.AddMapping<GeographicRegionHierarchyMember>();
            mapper.AddMapping<ClassificationScheme           >();
            mapper.AddMapping<ClassificationSchemeClassifier >();
            mapper.AddMapping<Classifier                     >();
            mapper.AddMapping<ExclusivityClassifier          >();
            mapper.AddMapping<NaicsClassifier                >();
            mapper.AddMapping<RestrictedClassifier           >();
            mapper.AddMapping<SponsoredClassifier            >();
            mapper.AddMapping<LifeCycleStage                 >();
            mapper.AddMapping<CountryJoin                    >();
            mapper.AddMapping<SubdivisionJoin                >();
            mapper.AddMapping<Currency                       >();
            mapper.AddMapping<Global                         >();
            mapper.AddMapping<Region                         >();
            mapper.AddMapping<SubRegion                      >();
            mapper.AddMapping<IntermediateRegion             >();
            mapper.AddMapping<IdentificationScheme           >();
            mapper.AddMapping<Identifier                     >();
            mapper.AddMapping<AutonomousAgent                >();
            mapper.AddMapping<AutonomousAgentIdentifier      >();
            mapper.AddMapping<Organisation                   >();
            mapper.AddMapping<OrganisationIdentifier         >();
            mapper.AddMapping<OrganisationalSubUnit          >();
            mapper.AddMapping<Branch                         >();
            mapper.AddMapping<Hierarchy                      >();
            mapper.AddMapping<HierarchyMember                >();
            mapper.AddMapping<Person                         >();
            mapper.AddMapping<LegalEntity                    >();
            mapper.AddMapping<Role                           >();
            mapper.AddMapping<AutonomousAgentInRole          >();
            mapper.AddMapping<PartyInRole                    >();
            mapper.AddMapping<OrganisationMember             >();
            mapper.AddMapping<LifeCycle                      >();
            mapper.AddMapping<DealType                       >();
            mapper.AddMapping<FeeType                        >();
        }

        private static bool IsDomainObject<TId>(
            Type type
            )
        {
            return type != typeof(DomainObject<TId>) && typeof(DomainObject<TId>).IsAssignableFrom(type);
        }
    }
}
