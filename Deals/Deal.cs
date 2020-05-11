using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Deals
{
    public abstract class Deal: Named<Guid>
    {
        public virtual DealType          Type        { get; protected set; }
        public virtual IList<Agreement>  Agreements  { get; protected set; }
        public virtual IList<DealParty>  Parties     { get; protected set; }
        public virtual IList<Commitment> Commitments { get; protected set; }
        public virtual Stage             Stage       { get; protected set; }
        public virtual bool              Restricted  { get; protected set; }
        public virtual string            ProjectName { get; protected set; }

        protected Deal() : base()
        {
        }

        protected Deal(
            Guid     id,
            string   name,
            DealType type,
            Stage    stage
            ) : base(
                id,
                name)
        {
            Type        = type;
            Stage       = stage;
            Agreements  = new List<Agreement >();
            Parties     = new List<DealParty >();
            Commitments = new List<Commitment>();
        }
    }
}
