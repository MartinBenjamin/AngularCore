using Agreements;
using System;
using System.Collections.Generic;

namespace Contracts
{
    public class Contract: Agreement
    {
        public virtual LegalSystem               GoverningLaw  { get; protected set; }
        public virtual DateTime?                 ExecutionDate { get; protected set; }
        public virtual DateTime?                 EffectiveDate { get; protected set; }
        public virtual Contract                  Supersedes    { get; protected set; }
        public virtual IList<ContractualElement> Elements      { get; protected set; }

        protected Contract(): base()
        {
        }

        protected Contract(
            Guid         id,
            string       title,
            LegalSystem  governingLaw,
            DateTime?    executiondate,
            DateTime?    effectiveDate,
            Contract     supersedes
            ): base(
                id,
                title)
        {
            GoverningLaw  = governingLaw;
            ExecutionDate = executiondate;
            EffectiveDate = effectiveDate;
            Supersedes    = supersedes;
            Elements      = new List<ContractualElement>();
        }
    }
}
