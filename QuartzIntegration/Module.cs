using Autofac;
using Quartz;
using Quartz.Impl;
using Quartz.Spi;

namespace QuartzIntegration
{
    public class Module: Autofac.Module
    {
        protected override void Load(
            ContainerBuilder builder
            )
        {
            builder
                .RegisterType<JobFactory>()
                .As<IJobFactory>();

            builder
                .RegisterType<JobListener>()
                .As<IJobListener>();

            builder
                .RegisterGeneric(typeof(JobWrapper<>))
                .As(typeof(JobWrapper<>))
                .InstancePerLifetimeScope();

            builder
                .Register(
                    c =>
                    {
                        var scheduler = StdSchedulerFactory.GetDefaultScheduler().Result;
                        scheduler.JobFactory = c.Resolve<IJobFactory>();
                        return scheduler;
                    })
                .As<IScheduler>();
        }
    }
}
