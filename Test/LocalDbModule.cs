using Autofac;
using NHibernateIntegration;
using System.Collections.Generic;

namespace Test
{
    public class LocalDbModule: Autofac.Module
    {
        private static readonly IDictionary<string, string> _properties = new Dictionary<string, string>
        {
            { "connection.driver_class"     , "NHibernate.Driver.SqlClientDriver"                                                 },
            { "connection.connection_string", "Data Source=(LocalDb)\\MSSQLLocalDB;Initial Catalog=Test;Integrated Security=SSPI" },
            { "dialect"                     , "NHibernate.Dialect.MsSql2012Dialect"                                               },
            { "show_sql"                    , "false"                                                                             }
        };

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
                .SingleInstance(); ;
        }
    }
}
