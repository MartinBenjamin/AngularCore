using Autofac;
using AutoMapper;

namespace Web
{
    public class MapperModule: Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .Register(c => new MapperConfiguration(cfg => cfg.AddProfile(new Profile())).CreateMapper())
                .As<IMapper>()
                .SingleInstance();
        }
    }
}
