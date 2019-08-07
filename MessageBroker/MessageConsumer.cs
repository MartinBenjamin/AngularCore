using log4net;
using NHibernate;
using System;
using System.Data;
using System.Threading.Tasks;

namespace MessageBroker
{
    public abstract class MessageConsumer : IMessageConsumer
    {
        private readonly ISession _session;
        private readonly ILog     _logger;

        public MessageConsumer(
            ISession session,
            ILog     logger
            )
        {
            _session = session;
            _logger  = logger;
        }

        async Task IMessageConsumer.Consume(
            Guid messageId
            )
        {
            using(var transaction = _session.BeginTransaction(IsolationLevel.RepeatableRead))
            {
                var message = await _session.GetAsync<Message>(
                    messageId,
                    LockMode.Upgrade);

                // Message may have been processed by a concurrent Message Bnoker and no longer exist.
                if(message != null)
                {
                    await Consume(message);
                    await _session.DeleteAsync(message);
                    await transaction.CommitAsync();
                }
            }
        }

        protected abstract Task Consume(Message message);
    }
}
