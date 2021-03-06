﻿namespace Ontology
{
    public abstract class PropertyRestriction: IPropertyRestriction
    {
        private readonly IPropertyExpression _propertyExpression;

        protected PropertyRestriction(
            IPropertyExpression propertyExpression
            )
        {
            _propertyExpression = propertyExpression;
        }

        IPropertyExpression IPropertyRestriction.PropertyExpression => _propertyExpression;

        public abstract void Accept(IClassExpressionVisitor visitor);

        public abstract bool Evaluate(
            IClassMembershipEvaluator evaluator,
            object                    individual);
    }
}
