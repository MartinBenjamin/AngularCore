using CommonDomainObjects;
using System;

namespace Contracts
{
    //English law/laws of England and Wales
    //German law
    //Indian law
    //Japanese law/laws of Japan
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
