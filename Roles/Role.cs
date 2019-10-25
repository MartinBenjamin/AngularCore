using CommonDomainObjects;
using System;

namespace Roles
{
    public class Role: Named<Guid>
    {
        protected Role() : base()
        {
        }

        public Role(
            string name
            ): base(
                Guid.NewGuid(),
                name)
        {
        }
    }
}
