using Autofac;
using Autofac.Features.OwnedInstances;
using Quartz;
using Quartz.Spi;
using System;
using System.Threading.Tasks;

namespace QuartzIntegration
{
    public class JobWrapper<TJob>: IJob
        where TJob: IJob
    {
        private readonly Func<Owned<TJob>> _jobFactory;

        public JobWrapper(
            Func<Owned<TJob>> jobFactory
            )
        {
            _jobFactory = jobFactory;
        }

        async Task IJob.Execute(
            IJobExecutionContext context
            )
        {
            using(var ownedJob = _jobFactory())
                await ownedJob.Value.Execute(context);
        }
    }

    public class JobFactory: IJobFactory
    {
        private IComponentContext _componentContext;

        public JobFactory(
            IComponentContext componentContext
            )
        {
            _componentContext = componentContext;
        }

        IJob IJobFactory.NewJob(
            TriggerFiredBundle bundle,
            IScheduler         scheduler
            )
        {
            var wrappedJobType = typeof(JobWrapper<>).MakeGenericType(bundle.JobDetail.JobType);
            return (IJob)_componentContext.Resolve(wrappedJobType);
        }

        void IJobFactory.ReturnJob(
            IJob job
            )
        {
        }
    }
}
