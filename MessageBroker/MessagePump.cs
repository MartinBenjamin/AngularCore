using Autofac.Features.OwnedInstances;
using CommonDomainObjects;
using log4net;
using NHibernate;
using NHibernate.Criterion;
using Quartz;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace MessageBroker
{
    public class MessagePump: IJob
    {
        private static readonly int _maxMessages   = 100;
        private static readonly int _maxConcurrent = 10;

        private readonly ISession                      _session;
        private readonly Func<Owned<IMessageConsumer>> _messageConsumerFactory;
        private readonly ILog                          _logger;

        public MessagePump(
            ISession                      session,
            Func<Owned<IMessageConsumer>> messageConsumerFactory,
            ILog                          logger
            )
        {
            _session                = session;
            _messageConsumerFactory = messageConsumerFactory;
            _logger                 = logger;
        }

        async Task IJob.Execute(
            IJobExecutionContext context
            )
        {
            IList<Guid> messagelds = null;

            try
            {
                var maxMessages   = _maxMessages;
                var maxConcurrent = _maxConcurrent;

                if(context.JobDetail.JobDataMap.ContainsKey("MaxMessages"))
                    maxMessages = context.JobDetail.JobDataMap.GetIntValue("MaxMessages");

                if(context.JobDetail.JobDataMap.ContainsKey("MaxConcurrent"))
                    maxConcurrent = context.JobDetail.JobDataMap.GetIntValue("MaxConcurrent");

                using(var transaction = _session.BeginTransaction(IsolationLevel.ReadCommitted))
                    messagelds = await _session
                        .CreateCriteria<Message>()
                        .SetMaxResults(maxMessages)
                        .SetProjection(Projections.Property("Id"))
                        .ListAsync<Guid>();

                await messagelds.Dispatch(
                    Consume,
                    maxConcurrent);
            }
            catch(Exception exception)
            {
                _logger.Error(
                    "Exception during execution",
                    exception);
            }
        }

        private async Task Consume(
            Guid messageId
            )
        {
            try
            {
                using(var ownedMessageConsumer = _messageConsumerFactory())
                    await ownedMessageConsumer.Value.Consume(messageId);

            }
            catch(Exception exception)
            {
                _logger.Error(
                    string.Format(
                        "Exception thrown while consuming message {0}.",
                        messageId),
                    exception);
            }
        }
    }
}
