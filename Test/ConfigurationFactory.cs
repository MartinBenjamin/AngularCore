using NHibernate.Cfg;
using NHibernateIntegration;
using System.Collections.Generic;

namespace Test
{
    public class ConfigurationFactory: IConfigurationFactory
    {
        public static readonly string DatabasePath = "Test.db";

        private static readonly IDictionary<string, string> _properties = new Dictionary<string, string>
        {
            { "connection.driver_class"     , "NHibernate.Driver.SQLite20Driver"                 },
            { "connection.connection_string", $"Data Source={ DatabasePath };Version=3;New=True" },
            { "dialect"                     , "NHibernate.Dialect.SQLiteDialect"                 },
            { "show_sql"                    , "false"                                            }
        };

        private IModelMapperFactory _modelMapperFactory;

        public ConfigurationFactory(
            IModelMapperFactory modelMapperFactory
            )
        {
            _modelMapperFactory = modelMapperFactory;
        }

        Configuration IConfigurationFactory.Build(
            string name
            )
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
