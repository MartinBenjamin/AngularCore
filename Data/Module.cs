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
                .Keyed<IEtl>(typeof(Role))
                .SingleInstance();

            builder
                .RegisterType<CurrencyLoader>()
                .Keyed<IEtl>(typeof(Currency))
                .SingleInstance();

            builder
                .RegisterType<CountryLoader>()
                .Keyed<IEtl>(typeof(Country))
                .SingleInstance();

            new[]
            {
                "ISO3166-2-AE.csv",
                "ISO3166-2-CA.csv",
                "ISO3166-2-GB.csv",
                "ISO3166-2-PT.csv",
                "ISO3166-2-US.csv"
            }.ForEach(fileName => builder
                .RegisterType<SubdivisionLoader>()
                .Keyed<IEtl>(typeof(Subdivision))
                .WithParameter("fileName", fileName)
                .SingleInstance());

            builder
                .RegisterType<Unsdm49Loader>()
                .As<IEtl<GeographicRegionHierarchy>>()
                .SingleInstance();

            builder
                .RegisterType<BranchLoader>()
                .Keyed<IEtl>(typeof(Branch))
                .SingleInstance();

            builder
                .RegisterType<ExclusivityLoader>()
                .As<IEtl<ClassificationScheme>>()
                .SingleInstance();

            builder
                .RegisterType<NaicsLoader>()
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
                .Keyed<IEtl>(typeof(FacilityFeeType))
                .SingleInstance();
        }
    }
}
