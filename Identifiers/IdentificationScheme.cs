using CommonDomainObjects;
using System;

namespace Identifiers
{
    public class IdentificationScheme: Named<Guid>
    {
        protected IdentificationScheme() : base()
        {
        }

        public IdentificationScheme(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}

