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
        public static readonly Guid MessageBroker = new Guid("91D858EF-B754-4376-972F-366E6BFC82FE");
    }
}
