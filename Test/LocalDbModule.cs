using Autofac;
using NHibernateIntegration;
using System.Collections.Generic;

namespace Test
{
    public class LocalDbModule: SessionFactoryModule
    {
        private static readonly IDictionary<string, string> _properties = new Dictionary<string, string>
        {
            { "connection.driver_class"     , "NHibernate.Driver.SqlClientDriver"                                                 },
            { "connection.connection_string", "Data Source=(LocalDb)\\MSSQLLocalDB;Initial Catalog=Test;Integrated Security=SSPI" },
            { "dialect"                     , "NHibernate.Dialect.MsSql2012Dialect"                                               },
            { "show_sql"                    , "false"                                                                             }
        };

        public LocalDbModule(
            string name
            ) : base(name)
        {
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
