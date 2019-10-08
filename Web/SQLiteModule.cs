using Autofac;
using NHibernateIntegration;
using System.Collections.Generic;

namespace Web
{
    public class SQLiteModule: SessionFactoryModule
    {
        private readonly IDictionary<string, string> _properties;

        public SQLiteModule(
            string name,
            string databasePath
            ) : base(name)
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
            base.Load(builder);
            builder
                .RegisterType<ConfigurationFactory>()
                .Named<IConfigurationFactory>(_name)
                .As<IConfigurationFactory>()
                .PreserveExistingDefaults()
                .WithParameter(
                    new TypedParameter(
                        typeof(IDictionary<string, string>),
                        _properties))
                .SingleInstance();
        }
    }
}
