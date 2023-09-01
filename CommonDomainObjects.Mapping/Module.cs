using Autofac;
using NHibernate.Mapping.ByCode;
using NHibernateIntegration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace CommonDomainObjects.Mapping
{
    public class Module: Autofac.Module
    {
        private static IList<Type> _types = new List<Type>
        {
            typeof(CommonDomainObjects.ClassificationScheme          ),
            typeof(CommonDomainObjects.ClassificationSchemeClassifier),
            typeof(CommonDomainObjects.Classifier                    ),
            typeof(LifeCycles.LifeCycle                              ),
            typeof(LifeCycles.LifeCycleStage                         ),
            typeof(Locations.GeographicRegion                        ),
            typeof(Locations.GeographicRegionIdentifier              ),
            typeof(Locations.GeographicSubregion                     ),
            typeof(Locations.GeographicRegionHierarchy               ),
            typeof(Locations.GeographicRegionHierarchyMember         ),
            typeof(Naics.NaicsClassifier                             ),
            typeof(Iso3166._1.Country                                ),
            typeof(Iso3166._2.Subdivision                            ),
            typeof(Iso4217.Currency                                  ),
            typeof(UnsdM49.Global                                    ),
            typeof(UnsdM49.Region                                    ),
            typeof(UnsdM49.SubRegion                                 ),
            typeof(UnsdM49.IntermediateRegion                        ),
            typeof(Identifiers.IdentificationScheme                  ),
            typeof(Identifiers.Identifier                            ),
            typeof(Agents.AutonomousAgent                            ),
            typeof(Agents.AutonomousAgentIdentifier                  ),
            typeof(Organisations.Organisation                        ),
            typeof(Organisations.OrganisationIdentifier              ),
            typeof(Organisations.OrganisationalSubUnit               ),
            typeof(Organisations.Branch                              ),
            typeof(Organisations.Hierarchy                           ),
            typeof(Organisations.HierarchyMember                     ),
            typeof(People.Person                                     ),
            typeof(LegalEntities.LegalEntity                         ),
            typeof(Roles.Role                                        ),
            typeof(Roles.AutonomousAgentInRole                       ),
            typeof(Parties.PartyInRole                               ),
            typeof(Parties.OrganisationMember                        ),
            typeof(Deals.DealType                                    ),
            typeof(FacilityAgreements.FeeType                        ),
            typeof(FacilityAgreements.FacilityType                   ),
            typeof(Deals.ExclusivityClassifier                       ),
            typeof(Deals.RestrictedClassifier                        ),
            typeof(Deals.SponsoredClassifier                         )
        };

        private static IList<Type> _notImported = new List<Type>
        {
            typeof(Locations._1.GeographicRegion         ),
            typeof(Locations._1.GeographicSubregion      ),
            typeof(Locations._1.GeographicRegionSubregion),
            typeof(Iso3166._1._1.Country                 ),
            typeof(Iso3166._2._1.Subdivision             ),
            typeof(UnsdM49._1.Global                     ),
            typeof(UnsdM49._1.Region                     ),
            typeof(UnsdM49._1.SubRegion                  ),
            typeof(UnsdM49._1.IntermediateRegion         )
        };

        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterModule<NHibernateIntegration.Module>();

            builder
                .Register<Action<ConventionModelMapper>>(
                    c => mapper =>
                    {
                        mapper.IsEntity((
                            Type type,
                            bool declared
                            ) => IsDomainObject<Guid>(type)
                                || IsDomainObject<string>(type)
                                || typeof(Identifiers.Identifier).IsAssignableFrom(type)
                                || typeof(Locations._1.GeographicRegionSubregion).IsAssignableFrom(type));

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
                    });

            builder
                .Register<Action<ConventionModelMapper>>(
                    c => mapper =>
                    {
                        var excluded = new Type[]
                        {
                            typeof(Country    ),
                            typeof(Subdivision),
                        };

                        mapper.AddMappings(Assembly.GetExecutingAssembly().GetTypes()
                            .Where(type => typeof(IConformistHoldersProvider).IsAssignableFrom(type) && !type.IsGenericTypeDefinition && !excluded.Contains(type)));
                    });

            builder
                .RegisterType<MappingFactory>()
                .As<IMappingFactory>()
                .WithParameter("types", _types);

            builder
                .RegisterType<MappingFactory>()
                .As<IMappingFactory>()
                .WithParameter("types", _notImported)
                .WithParameter("autoImport", false);
        }

        private static bool IsDomainObject<TId>(
            Type type
            )
        {
            return type != typeof(DomainObject<TId>) && typeof(DomainObject<TId>).IsAssignableFrom(type);
        }
    }
}
