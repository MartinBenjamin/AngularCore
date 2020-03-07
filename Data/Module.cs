using Autofac;
using Iso4217;
using Locations;
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
                .RegisterType<CurrencyLoader>()
                .As<IEtl<IEnumerable<Currency>>>()
                .SingleInstance();

            builder
                .RegisterType<GeographicRegionHierarchyLoader>()
                .As<IEtl<GeographicRegionHierarchy>>()
                .SingleInstance();
        }
    }
}
