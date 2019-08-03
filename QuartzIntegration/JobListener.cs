using log4net;
using Quartz;
using System.Threading;
using System.Threading.Tasks;

namespace QuartzIntegration
{
    public class JobListener: IJobListener
    {
            string IJobListener.Name
            {
                get
                {
                    return "Job Listener";
                }
            }

            Task IJobListener.JobExecutionVetoed(
                IJobExecutionContext context,
                CancellationToken    cancellationToken
                )
            {
                return Task.CompletedTask;
            }

            Task IJobListener.JobToBeExecuted(
                IJobExecutionContext context,
                CancellationToken    cancellationToken
                )
            {
                LogManager.GetLogger(context.JobDetail.JobType).Info("To be executed.");
                return Task.CompletedTask;
            }

            Task IJobListener.JobWasExecuted(
                IJobExecutionContext  context,
                JobExecutionException jobException,
                CancellationToken     cancellationToken
                )
            {
                LogManager.GetLogger(context.JobDetail.JobType).Info("Was executed.");
                return Task.CompletedTask;
            }
    }
}
