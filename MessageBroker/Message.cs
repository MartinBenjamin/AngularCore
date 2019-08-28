﻿using CommonDomainObjects;
using System;

namespace MessageBroker
{
    public abstract class Message: DomainObject<Guid>
    {
        public virtual MessageQueue Queue { get; set; }

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
