using Autofac;
using Microsoft.AspNetCore.Mvc;

namespace Web
{
    public class ControllerModule: Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterAssemblyTypes(ThisAssembly)
                .Where(type => type.IsAssignableTo<ControllerBase>() && !type.IsAbstract)
                .AsSelf()
                .PropertiesAutowired()
                .InstancePerLifetimeScope();
        }
    }
}
