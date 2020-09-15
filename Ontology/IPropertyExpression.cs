using System.Collections.Generic;

namespace Ontology
{
    public interface IPropertyExpression: IEntity
    {
        IEnumerable<object> Values(
            IOntology context,
            object    individual);
    }

    public interface IObjectPropertyExpression: IPropertyExpression
    {
    }

    public interface IDataPropertyExpression: IPropertyExpression
    {
        IList<IDataPropertyRange> Ranges { get; }

        bool AreEqual(
            IOntology context,
            object    lhs,
            object    rhs);
    }
}
