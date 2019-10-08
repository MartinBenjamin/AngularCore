using Autofac;
using NHibernateIntegration;
using System.Collections.Generic;

namespace Test
{
    public class SQLiteModule: SessionFactoryModule
    {
        public static readonly string DatabasePath = "Test.db";

        private static readonly IDictionary<string, string> _properties = new Dictionary<string, string>
        {
            { "connection.driver_class"     , "NHibernate.Driver.SQLite20Driver"                 },
            { "connection.connection_string", $"Data Source={ DatabasePath };Version=3;New=True" },
            { "dialect"                     , "NHibernate.Dialect.SQLiteDialect"                 },
            { "show_sql"                    , "false"                                            }
        };

        public SQLiteModule(
            string name
            ): base(name)
        {
            _name = name;
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
