using CommonDomainObjects;
using System;

namespace MessageBroker
{
    public class MessageQueue: DomainObject<Guid>
    {
        protected MessageQueue(): base()
        {
        }

        public MessageQueue(
            Guid id
            ) : base(id)
        {
        }
    }

    public static class MessageQueueIdentifier
    {
        public static readonly Guid MessageBroker = new Guid("91d858ef-b754-4376-972f-366e6bfc82fe");
    }
}
