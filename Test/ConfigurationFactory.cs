using NHibernate.Cfg;
using NHibernateIntegration;
using System.Collections.Generic;

namespace Test
{
    public abstract class ConfigurationFactory: IConfigurationFactory
    {
        private readonly IModelMapperFactory         _modelMapperFactory;
        private readonly IDictionary<string, string> _properties;

        protected ConfigurationFactory(
            IModelMapperFactory         modelMapperFactory,
            IDictionary<string, string> properties
            )
        {
            _modelMapperFactory = modelMapperFactory;
            _properties         = properties;
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

    public class SQLiteConfigurationFactory: ConfigurationFactory
    {
        public static readonly string DatabasePath = "Test.db";

        private static readonly IDictionary<string, string> _properties = new Dictionary<string, string>
        {
            { "connection.driver_class"     , "NHibernate.Driver.SQLite20Driver"                 },
            { "connection.connection_string", $"Data Source={ DatabasePath };Version=3;New=True" },
            { "dialect"                     , "NHibernate.Dialect.SQLiteDialect"                 },
            { "show_sql"                    , "false"                                            }
        };

        public SQLiteConfigurationFactory(
            IModelMapperFactory modelMapperFactory
            ) : base(
                modelMapperFactory,
                _properties)
        {
        }
    }

    public class LocalDbConfigurationFactory: ConfigurationFactory
    {
        private static readonly IDictionary<string, string> _properties = new Dictionary<string, string>
        {
            { "connection.driver_class"     , "NHibernate.Driver.SqlClientDriver"                                                 },
            { "connection.connection_string", "Data Source=(LocalDb)\\MSSQLLocalDB;Initial Catalog=Test;Integrated Security=SSPI" },
            { "dialect"                     , "NHibernate.Dialect.MsSql2012Dialect"                                               },
            { "show_sql"                    , "false"                                                                             }
        };

        public LocalDbConfigurationFactory(
            IModelMapperFactory modelMapperFactory
            ) : base(
                modelMapperFactory,
                _properties)
        {
        }
    }
}
