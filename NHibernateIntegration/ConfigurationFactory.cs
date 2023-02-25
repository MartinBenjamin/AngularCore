using NHibernate.Cfg;
using System.Collections.Generic;

namespace NHibernateIntegration
{
    public class ConfigurationFactory: IConfigurationFactory
    {
        private readonly IEnumerable<IMappingFactory> _mappingFactories;
        private readonly IDictionary<string, string>  _properties;

        public ConfigurationFactory(
            IEnumerable<IMappingFactory> mappingFactories,
            IDictionary<string, string>  properties
            )
        {
            _mappingFactories   = mappingFactories;
            _properties         = properties;
        }

        Configuration IConfigurationFactory.Build()
        {
            var configuration = new Configuration()
                .SetProperties(_properties);
            foreach(var mappingFactory in _mappingFactories)
                configuration.AddDeserializedMapping(
                    mappingFactory.Build(),
                    null);
            return configuration;
        }
    }
}
