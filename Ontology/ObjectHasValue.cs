﻿using System.Linq;

namespace Ontology
{
    public class ObjectHasValue:
        ObjectPropertyRestriction,
        IObjectHasValue
    {
        private object _individual;

        public ObjectHasValue(
            IObjectPropertyExpression objectPropertyExpression,
            object                    individual
            ) : base(objectPropertyExpression)
        {
            _individual = individual;
        }

        object IObjectHasValue.Individual => _individual;

        public override bool HasMember(
            object individual
            ) => individual is INamedIndividual namdedIndividual &&
                _objectPropertyExpression
                    .Values(individual)
                    .Any(value => namdedIndividual.Ontology.AreEqual(individual, value));
    }
}
