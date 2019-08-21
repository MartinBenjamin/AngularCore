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

    public class LocalDbConfigurationFactory: IConfigurationFactory
    {
        public static readonly string DatabasePath = "Test.mdf";

        private static readonly IDictionary<string, string> _properties = new Dictionary<string, string>
        {
            { "connection.driver_class"     , "NHibernate.Driver.SqlClientDriver"                },
            { "connection.connection_string", $"Data Source=(LocalDb)\\MSSQLLocalDB;Initial Catalog=Test;Integrated Security=SSPI" },
            { "dialect"                     , "NHibernate.Dialect.MsSql2008Dialect"              },
            { "show_sql"                    , "false"                                            }
        };

        private IModelMapperFactory _modelMapperFactory;

        public LocalDbConfigurationFactory(
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
