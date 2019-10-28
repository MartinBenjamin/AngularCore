using CommonDomainObjects;
using System;

namespace Contracts
{
    public class Jurisdiction: Named<Guid>
    {
        protected Jurisdiction(): base()
        {
        }

        public Jurisdiction(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
