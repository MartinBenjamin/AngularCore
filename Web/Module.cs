using Autofac;
using Microsoft.AspNetCore.Mvc;

namespace Web
{
    public class Module: Autofac.Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterAssemblyTypes(ThisAssembly)
                .Where(type => type.IsAssignableTo<Controller>())
                .AsSelf()
                .PropertiesAutowired()
                .InstancePerLifetimeScope();
        }
    }
}
