﻿namespace Ontology
{
    public abstract class DataPropertyRestriction:
        PropertyRestriction,
        IDataPropertyRestriction
    {
        protected readonly IDataPropertyExpression _dataPropertyExpression;

        protected DataPropertyRestriction(
            IDataPropertyExpression dataPropertyExpression
            ) : base(dataPropertyExpression)
        {
            _dataPropertyExpression = dataPropertyExpression;
        }

        IDataPropertyExpression IDataPropertyRestriction.DataPropertyExpression => _dataPropertyExpression;
    }
}
