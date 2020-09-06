﻿using System.Collections.Generic;
using System.Linq;

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
            IDictionary<object, HashSet<IClassExpression>>
                   classifications,
            object individual
            ) => _objectPropertyExpression
                .Values(individual)
                .Any(value => _objectPropertyExpression.Ontology.AreEqual(
                    classifications,
                    _individual,
                    value));
    }
}
