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
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }

        public Role(
            string name
            ): this(
                Guid.NewGuid(),
                name)
        {
        }
    }
}
