using Autofac;
using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using LifeCycles;
using Locations;
using Organisations;
using Roles;
using System.Security.Cryptography;

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
                .Register(c => SHA1.Create())
                .As<HashAlgorithm>()
                .SingleInstance();

            builder
                .RegisterType<GuidGenerator>()
                .As<IGuidGenerator>()
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
                "AE",
                "CA",
                "GB",
                "KN",
                "PT",
                "US"
            }.ForEach(alpha2Code => builder
                .RegisterType<SubdivisionLoader>()
                .Keyed<IEtl>(typeof(Subdivision))
                .Keyed<SubdivisionLoader>(alpha2Code)
                .WithParameter("fileName", $"ISO3166-2-{alpha2Code}.csv")
                .SingleInstance());

            builder
                .RegisterType<Unsdm49Loader>()
                .Keyed<IEtl>(typeof(GeographicRegionHierarchy))
                .SingleInstance();

            builder
                .RegisterType<BranchLoader>()
                .Keyed<IEtl>(typeof(Branch))
                .SingleInstance();

            builder
                .RegisterType<ExclusivityLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(ExclusivityLoader))
                .SingleInstance();

            builder
                .RegisterType<NaicsLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(NaicsLoader))
                .SingleInstance();

            builder
                .RegisterType<RestrictedLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(RestrictedLoader))
                .SingleInstance();

            builder
                .RegisterType<SponsoredLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(SponsoredLoader))
                .SingleInstance();

            builder
                .RegisterType<DealTypeLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(DealTypeLoader))
                .SingleInstance();

            builder
                .RegisterType<DealStageLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(DealStageLoader))
                .SingleInstance();

            builder
                .RegisterType<FacilityTypeLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(FacilityTypeLoader))
                .SingleInstance();

            builder
                .RegisterType<FacilityFeeTypeLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(FacilityFeeTypeLoader))
                .SingleInstance();

            builder
                .RegisterType<OtherFeeTypeLoader>()
                .Keyed<IEtl>(typeof(ClassificationScheme))
                .Keyed<IEtl>(typeof(OtherFeeTypeLoader))
                .SingleInstance();

            builder
                .RegisterType<LifeCycleLoader>()
                .Keyed<IEtl>(typeof(LifeCycle))
                .SingleInstance();
        }
    }
}
