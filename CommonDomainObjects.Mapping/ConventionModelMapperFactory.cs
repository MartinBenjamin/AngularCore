using NHibernate.Mapping.ByCode;
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

            mapper.Class<DomainObject<Guid>>(
                classMapper => classMapper.Id(
                    domainObject => domainObject.Id,
                    idMapper => idMapper.Generator(Generators.Guid)));

            mapper.AddMapping<GeographicalArea>();
            mapper.AddMapping<Country         >();
            mapper.AddMapping<Subdivision     >();
            mapper.AddMapping<Currency        >();
        }

        private static bool IsDomainObject<TId>(
            Type type
            )
        {
            return type != typeof(DomainObject<TId>) && typeof(DomainObject<TId>).IsAssignableFrom(type);
        }
    }
}
