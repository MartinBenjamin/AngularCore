using Autofac;
using NHibernateIntegration;
using System.Collections.Generic;

namespace Web
{
    public class SQLiteModule: Autofac.Module
    {
        private readonly IDictionary<string, string> _properties;

        public SQLiteModule(
            string databasePath
            )
        {
            _properties = new Dictionary<string, string>
            {
                { "connection.driver_class"     , "NHibernate.Driver.SQLite20Driver"         },
                { "connection.connection_string", $"Data Source={ databasePath };Version=3;" },
                { "dialect"                     , "NHibernate.Dialect.SQLiteDialect"         },
                { "show_sql"                    , "false"                                    }
            };
        }

        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterType<ConfigurationFactory>()
                .As<IConfigurationFactory>()
                .WithParameter(
                    new TypedParameter(
                        typeof(IDictionary<string, string>),
                        _properties))
                .SingleInstance();
        }
    }
}
