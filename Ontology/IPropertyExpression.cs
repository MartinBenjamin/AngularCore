using System.Collections.Generic;

namespace Ontology
{
    public interface IPropertyExpression: IEntity
    {
        IClassExpression    Domain { get; }
        IEnumerable<object> Values(object individual);
    }

    public interface IObjectPropertyExpression: IPropertyExpression
    {
        IClassExpression Range { get; }
    }

    public interface IDataPropertyExpression: IPropertyExpression
    {
    }
}
