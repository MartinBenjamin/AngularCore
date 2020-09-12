using System.Collections.Generic;

namespace Ontology
{
    public interface IPropertyExpression: IEntity
    {
        IEnumerable<object> Values(object individual);
    }

    public interface IObjectPropertyExpression: IPropertyExpression
    {
    }

    public interface IDataPropertyExpression: IPropertyExpression
    {
        IList<IDataPropertyRange> Ranges { get; }

        bool AreEqual(
            object lhs,
            object rhs);
    }
}
