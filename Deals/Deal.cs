using Agreements;
using CommonDomainObjects;
using Locations;
using Ontology;
using Parties;
using System;
using System.Collections.Generic;

namespace Deals
{
    public class Deal:
        Named<Guid>,
        IIndividual
    {
        public virtual string             ClassIri         { get; protected set; }
        public virtual DealType           Type             { get; protected set; }
        public virtual IList<Agreement>   Agreements       { get; protected set; }
        public virtual IList<PartyInRole> Parties          { get; protected set; }
        public virtual IList<Commitment>  Commitments      { get; protected set; }
        public virtual Stage              Stage            { get; protected set; }
        public virtual bool               Restricted       { get; protected set; }
        public virtual string             ProjectName      { get; protected set; }
        public virtual IList<Classifier>  Classifiers      { get; protected set; }
        public virtual GeographicRegion   GeographicRegion { get; protected set; }

        protected Deal() : base()
        {
        }

        public Deal(
            Guid     id,
            string   name,
            string   classIri,
            DealType type,
            Stage    stage
            ) : base(
                id,
                name)
        {
            ClassIri    = classIri;
            Type        = type;
            Stage       = stage;
            Agreements  = new List<Agreement  >();
            Parties     = new List<PartyInRole>();
            Commitments = new List<Commitment >();
            Classifiers = new List<Classifier >();
        }
    }
}
