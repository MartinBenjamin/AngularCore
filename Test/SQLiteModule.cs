using Autofac;
using NHibernate;
using NHibernateIntegration;
using System.Collections.Generic;

namespace Test
{
    public class SQLiteModule: Web.SQLiteModule
    {
        public static readonly string DatabasePath = "Test.db";

        public SQLiteModule(
            string name
            ): base(
                name,
                DatabasePath)
        {
        }
    }

    public class SQLiteInMemoryModule: Autofac.Module
    {
        private static readonly IDictionary<string, string> _properties = new Dictionary<string, string>
        {
            { "connection.driver_class"     , "NHibernate.Driver.SQLite20Driver" },
            { "connection.connection_string", "Data Source=:memory:;Version=3;"  },
            { "dialect"                     , "NHibernate.Dialect.SQLiteDialect" },
            { "show_sql"                    , "false"                            },
            { "connection.release_mode"     , "on_close"                         }
        };

        private string _name;

        public SQLiteInMemoryModule(
            string name
            )
        {
            _name = name;
        }

        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .Register(c => c.ResolveNamed<IConfigurationFactory>(_name).Build().BuildSessionFactory())
                .Named<ISessionFactory>(_name)
                .As<ISessionFactory>()
                .PreserveExistingDefaults()
                .SingleInstance();
            builder
                .Register(c => c.ResolveNamed<ISessionFactory>(_name).OpenSession())
                .Named<ISession>(_name)
                .As<ISession>()
                .PreserveExistingDefaults()
                .SingleInstance();
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
