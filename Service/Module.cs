using Autofac;
using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
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
                .RegisterType<NamedService<string, GeographicalArea, NamedFilters>>()
                .As<INamedService<string, GeographicalArea, NamedFilters>>();
            builder
                .RegisterType<NamedService<string, Country, NamedFilters>>()
                .As<INamedService<string, Country, NamedFilters>>();
            builder
                .RegisterType<NamedService<string, Subdivision, NamedFilters>>()
                .As<INamedService<string, Subdivision, NamedFilters>>();
            builder
                .RegisterType<NamedService<string, Currency, NamedFilters>>()
                .As<INamedService<string, Currency, NamedFilters>>();
            builder
                .RegisterType<NamedService<string, Global, NamedFilters>>()
                .As<INamedService<string, Global, NamedFilters>>();
            builder
                .RegisterType<NamedService<string, Region, NamedFilters>>()
                .As<INamedService<string, Region, NamedFilters>>();
            builder
                .RegisterType<NamedService<string, SubRegion, NamedFilters>>()
                .As<INamedService<string, SubRegion, NamedFilters>>();
            builder
                .RegisterType<NamedService<string, IntermediateRegion, NamedFilters>>()
                .As<INamedService<string, IntermediateRegion, NamedFilters>>();

        }
    }
}
