using Autofac;
using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using LegalEntities;
using Locations;
using Organisations;
using People;
using Roles;
using System;
using UnsdM49;

namespace Service
{
    public class Module: Autofac.Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterType<ClassificationSchemeService>()
                .As<IDomainObjectService<Guid, ClassificationScheme>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<GeographicRegionHierarchyService>()
                .As<IDomainObjectService<Guid, GeographicRegionHierarchy>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<DealLifeCycleService>()
                .As<IDealLifeCycleService>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, GeographicRegion, NamedFilters>>()
                .As<INamedService<Guid, GeographicRegion, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, Country, NamedFilters>>()
                .As<INamedService<Guid, Country, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, Subdivision, NamedFilters>>()
                .As<INamedService<Guid, Subdivision, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, Currency, NamedFilters>>()
                .As<INamedService<Guid, Currency, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, Global, NamedFilters>>()
                .As<INamedService<Guid, Global, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, Region, NamedFilters>>()
                .As<INamedService<Guid, Region, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, SubRegion, NamedFilters>>()
                .As<INamedService<Guid, SubRegion, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, IntermediateRegion, NamedFilters>>()
                .As<INamedService<Guid, IntermediateRegion, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, Branch, NamedFilters>>()
                .As<INamedService<Guid, Branch, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<LegalEntityService>()
                .As<INamedService<Guid, LegalEntity, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, Person, NamedFilters>>()
                .As<INamedService<Guid, Person, NamedFilters>>()
                .InstancePerLifetimeScope();
            builder
                .RegisterType<NamedService<Guid, Role, NamedFilters>>()
                .As<INamedService<Guid, Role, NamedFilters>>()
                .InstancePerLifetimeScope();
        }
    }
}
