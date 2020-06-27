using Agents;
using Autofac;
using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using Locations;
using Organisations;
using Roles;
using System.Collections.Generic;

namespace Data
{
    public class Module: Autofac.Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterType<CsvExtractor>()
                .As<ICsvExtractor>()
                .SingleInstance();

            builder
                .RegisterType<RoleLoader>()
                .As<IEtl<IEnumerable<Role>>>()
                .SingleInstance();

            builder
                .RegisterType<CurrencyLoader>()
                .As<IEtl<IEnumerable<Currency>>>()
                .SingleInstance();

            builder
                .RegisterType<CountryLoader>()
                .As<IEtl<IEnumerable<Country>>>()
                .SingleInstance();

            builder
                .RegisterType<SubdivisionLoader>()
                .As<IEtl<IEnumerable<Subdivision>>>()
                .SingleInstance();

            builder
                .RegisterType<GeographicRegionHierarchyLoader>()
                .As<IEtl<GeographicRegionHierarchy>>()
                .SingleInstance();

            builder
                .RegisterType<BranchLoader>()
                .As<IEtl<IEnumerable<(Branch, Identifier)>>>()
                .SingleInstance();

            builder
                .RegisterType<ExclusivityLoader>()
                .As<IEtl<ClassificationScheme>>()
                .SingleInstance();
        }
    }
}
