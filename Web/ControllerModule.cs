using Autofac;
using Microsoft.AspNetCore.Mvc;

namespace Web
{
    public class ControllerModule: Autofac.Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterAssemblyTypes(ThisAssembly)
                .Where(type => type.IsAssignableTo<ControllerBase>())
                .AsSelf()
                .PropertiesAutowired()
                .InstancePerLifetimeScope();
        }
    }
}
