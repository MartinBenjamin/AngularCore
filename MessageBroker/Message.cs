using CommonDomainObjects;
using System;

namespace MessageBroker
{
    public abstract class Message: DomainObject<Guid>
    {
        protected Message()
            : base()
        {
        }

        protected Message(
            Guid id
            )
            : base(id)
        {
        }
    }
}
