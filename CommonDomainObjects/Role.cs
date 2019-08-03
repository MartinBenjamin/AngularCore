using System;

namespace CommonDomainObjects
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
