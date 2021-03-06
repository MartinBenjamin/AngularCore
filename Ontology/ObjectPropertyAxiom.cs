﻿namespace Ontology
{
    public abstract class ObjectPropertyAxiom:
        Axiom,
        IObjectPropertyAxiom
    {
        private readonly IObjectPropertyExpression _objectPropertyExpression;

        protected ObjectPropertyAxiom(
            IOntology                 ontology,
            IObjectPropertyExpression objectPropertyExpression
            ) : base(ontology)
        {
            _objectPropertyExpression = objectPropertyExpression;
        }

        IObjectPropertyExpression IObjectPropertyAxiom.ObjectPropertyExpression => _objectPropertyExpression;
    }
}
