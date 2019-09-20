using Autofac;
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
        }
    }
}
