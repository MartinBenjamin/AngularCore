using Agreements;
using System;
using System.Collections.Generic;

namespace Contracts
{
    public class Contract: Agreement
    {
        public virtual Jurisdiction        GoverningJurisdiction { get; protected set; }
        public virtual IList<ContractDate> Dates                 { get; protected set; }
        public virtual Contract            Supersedes            { get; protected set; }

        protected Contract() : base()
        {
        }

        protected Contract(
            Guid         id,
            string       title,
            Jurisdiction governingJurisdiction,
            Contract     supersedes
            ) : base(
                id,
                title)
        {
            GoverningJurisdiction = governingJurisdiction;
            Supersedes            = supersedes;
        }
    }
}
