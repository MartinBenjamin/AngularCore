﻿namespace Ontology
{
    public abstract class ObjectPropertyRestriction:
        PropertyRestriction,
        IObjectPropertyRestriction
    {
        protected readonly IObjectPropertyExpression _objectPropertyExpression;

        protected ObjectPropertyRestriction(
            IObjectPropertyExpression objectPropertyExpression
            ) : base(objectPropertyExpression)
        {
            _objectPropertyExpression = objectPropertyExpression;
        }

        IObjectPropertyExpression IObjectPropertyRestriction.ObjectPropertyExpression => _objectPropertyExpression;
    }
}
