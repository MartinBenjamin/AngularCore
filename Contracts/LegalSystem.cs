using CommonDomainObjects;
using System;

namespace Contracts
{
    // e.g. English Law or Laws of England and Wales. 
    public class LegalSystem: Named<Guid>
    {
        protected LegalSystem() : base()
        {
        }

        public LegalSystem(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
