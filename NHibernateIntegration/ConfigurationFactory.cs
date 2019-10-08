using NHibernate.Cfg;
using System.Collections.Generic;

namespace NHibernateIntegration
{
    public class ConfigurationFactory: IConfigurationFactory
    {
        private readonly IModelMapperFactory         _modelMapperFactory;
        private readonly IDictionary<string, string> _properties;

        public ConfigurationFactory(
            IModelMapperFactory         modelMapperFactory,
            IDictionary<string, string> properties
            )
        {
            _modelMapperFactory = modelMapperFactory;
            _properties         = properties;
        }

        Configuration IConfigurationFactory.Build()
        {
            var mapper = _modelMapperFactory.Build();
            var mapping = mapper.CompileMappingForAllExplicitlyAddedEntities();
            var configuration = new Configuration()
                .SetProperties(_properties);
            configuration.AddDeserializedMapping(
                mapping,
                null);
            return configuration;
        }
    }
}
