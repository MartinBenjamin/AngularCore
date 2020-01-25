using Agreements;
using System;
using System.Collections.Generic;

namespace Contracts
{
    public class Contract: Agreement
    {
        public virtual Jurisdiction              GovernedBy { get; protected set; }
        public virtual IList<ContractDate>       Dates      { get; protected set; }
        public virtual Contract                  Supersedes { get; protected set; }
        public virtual IList<ContractualElement> Elements   { get; protected set; }

        protected Contract(): base()
        {
        }

        protected Contract(
            Guid         id,
            string       title,
            Jurisdiction governedBy,
            Contract     supersedes
            ): base(
                id,
                title)
        {
            GovernedBy = governedBy;
            Supersedes = supersedes;
            Elements   = new List<ContractualElement>();
        }
    }
}
