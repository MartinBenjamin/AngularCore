using log4net;
using NHibernate;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace MessageBroker
{
    public class MessageBroker:
        MessageConsumer,
        IMessageBroker
    {
        private readonly IEnumerable<IMessageHandler> _handlers;
        private readonly ILog                         _logger;

        public MessageBroker(
            ISession                     session,
            IEnumerable<IMessageHandler> handlers,
            ILog                         logger
            ) :base(
                session,
                logger)
        {
            _handlers = handlers;
            _logger   = logger;
        }

        protected override async Task Consume(
            Message message
            )
        {
            foreach(var handler in _handlers.Where(handler => handler.Type == message.GetType()))
            {
                _logger.Debug(
                    string.Format(
                        "Invoking handler {0} for message {1}.",
                        handler,
                        message));

                await handler.Handle(
                    this,
                    message);
            }
        }

        async Task IMessageBroker.Handle(
            Message message
            )
        {
            await Consume(message);
        }
    }
}
