using Agents;
using Autofac;
using CommonDomainObjects;
using FacilityAgreements;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using LifeCycles;
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
                .RegisterType<Unsdm49Loader>()
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

            builder
                .RegisterType<DealTypeLoader>()
                .As<IEtl<ClassificationScheme>>()
                .SingleInstance();

            builder
                .RegisterType<DealStageLoader>()
                .As<IEtl<ClassificationScheme>>()
                .SingleInstance();

            builder
                .RegisterType<LifeCycleLoader>()
                .As<IEtl<IEnumerable<LifeCycle>>>()
                .SingleInstance();

            builder
                .RegisterType<FacilityFeeTypeLoader>()
                .As<IEtl<IEnumerable<FacilityFeeType>>>()
                .SingleInstance();
        }
    }
}
