﻿using Autofac;
using CommonDomainObjects;

namespace Service
{
    public class Module: Autofac.Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterType<NamedService<string, Country>>()
                .As<INamedService<string, Country>>();
        }
    }
}
