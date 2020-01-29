using CommonDomainObjects;
using System;

namespace Agents
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
