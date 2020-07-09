using CommonDomainObjects;
using Locations;
using Ontology;
using System;
using System.Collections.Generic;

namespace Deals
{
    public class Deal:
        Named<Guid>,
        IIndividual
    {
        public virtual string            ClassName        { get; protected set; }
        public virtual DealType          Type             { get; protected set; }
        public virtual IList<Agreement>  Agreements       { get; protected set; }
        public virtual IList<DealParty>  Parties          { get; protected set; }
        public virtual IList<Commitment> Commitments      { get; protected set; }
        public virtual Stage             Stage            { get; protected set; }
        public virtual bool              Restricted       { get; protected set; }
        public virtual string            ProjectName      { get; protected set; }
        public virtual IList<Classifier> Classifiers      { get; protected set; }
        public virtual GeographicRegion  GeographicRegion { get; protected set; }

        protected Deal() : base()
        {
        }

        public Deal(
            Guid     id,
            string   name,
            string   className,
            DealType type,
            Stage    stage
            ) : base(
                id,
                name)
        {
            ClassName   = className;
            Type        = type;
            Stage       = stage;
            Agreements  = new List<Agreement >();
            Parties     = new List<DealParty >();
            Commitments = new List<Commitment>();
            Classifiers = new List<Classifier>();
        }
    }
}
