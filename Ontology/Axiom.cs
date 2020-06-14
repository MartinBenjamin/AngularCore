using System;
using System.Collections.Generic;

namespace Ontology
{
    public abstract class Axiom:
        Annotated,
        IAxiom
    {
        protected IOntology _ontology;

        protected Axiom(
            IOntology ontology
            )
        {
            _ontology = ontology;
        }

        IOntology IAxiom.Ontology => _ontology;
    }
}
