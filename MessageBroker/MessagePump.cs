using Autofac.Features.Indexed;
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

        private readonly ISession                                    _session;
        private readonly IIndex<Guid, Func<Owned<IMessageConsumer>>> _messageConsumerFactory;
        private readonly ILog                                        _logger;

        public MessagePump(
            ISession                                    session,
            IIndex<Guid, Func<Owned<IMessageConsumer>>> messageConsumerFactory,
            ILog                                        logger
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
            IList<object[]> messages = null;

            try
            {
                var maxMessages   = _maxMessages;
                var maxConcurrent = _maxConcurrent;

                var jobDataMap = context.JobDetail.JobDataMap;
                if(jobDataMap.ContainsKey("MaxMessages"))
                    maxMessages = jobDataMap.GetIntValue("MaxMessages");

                if(jobDataMap.ContainsKey("MaxConcurrent"))
                    maxConcurrent = jobDataMap.GetIntValue("MaxConcurrent");

                var queueIds = (Guid[])jobDataMap["QueueIds"];

                using(var transaction = _session.BeginTransaction(IsolationLevel.ReadCommitted))
                {
                    var criteria = _session
                        .CreateCriteria<Message>("message");

                    criteria
                        .CreateCriteria("Queue", "queue")
                            .Add(Expression.In("queue.Id", queueIds));

                    criteria
                        .SetProjection(
                            Projections.Property("message.Id"),
                            Projections.Property("queue.Id"  ));

                    messages = await criteria
                        .SetMaxResults(maxMessages)
                        .ListAsync<object[]>();
                }

                await messages
                    .Dispatch(
                        messageDetails => Consume(
                            (Guid)messageDetails[0],
                            (Guid)messageDetails[1]),
                        maxConcurrent);
            }
            catch(Exception exception)
            {
                _logger.Error(
                    "Exception during execution.",
                    exception);
            }
        }

        private async Task Consume(
            Guid messageId,
            Guid queueId
            )
        {
            try
            {
                using(var ownedMessageConsumer = _messageConsumerFactory[queueId]())
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
