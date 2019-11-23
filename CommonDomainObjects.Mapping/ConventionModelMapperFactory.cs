﻿using NHibernate.Mapping.ByCode;
using NHibernate.Mapping.ByCode.Impl;
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
            mapper.AddMapping<Hierarchy                      >();
            mapper.AddMapping<HierarchyMember                >();
            mapper.AddMapping<Person                         >();
            mapper.AddMapping<LegalEntity                    >();
            mapper.AddMapping<Role                           >();
            mapper.AddMapping<AutonomousAgentInRole          >();
            mapper.AddMapping<PartyInRole                    >();
        }

        private static bool IsDomainObject<TId>(
            Type type
            )
        {
            return type != typeof(DomainObject<TId>) && typeof(DomainObject<TId>).IsAssignableFrom(type);
        }
    }
}
