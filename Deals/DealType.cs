using CommonDomainObjects;
using Roles;
using System;
using System.Collections.Generic;

namespace Deals
{
    public class DealType: Named<Guid>
    {
        public virtual IList<Role> KeyCounterparties { get; protected set; }

        protected DealType() : base()
        {
        }
    }
}
