using System.Collections.Generic;

namespace Ontology
{
    public interface IPropertyExpression
    {
        IEnumerable<object> Values(object individual);
    }

    public interface IObjectPropertyExpression: IPropertyExpression
    {
    }

    public interface IDataPropertyExpression: IPropertyExpression
    {
    }

    public interface IProperty:
        IPropertyExpression,
        IEntity
    {
    }

    public interface IObjectProperty:
        IProperty,
        IObjectPropertyExpression
    {
    }

    public interface IDataProperty:
        IProperty,
        IDataPropertyExpression
    {
    }

    public interface IFunctionalPropertyExpression: IPropertyExpression
    {
        object Value(object individual);
    }

    public interface IFunctionalObjectPropertyExpression:
        IObjectPropertyExpression,
        IFunctionalPropertyExpression
    {
    }

    public interface IFunctionalDataPropertyExpression:
        IDataPropertyExpression,
        IFunctionalPropertyExpression
    {
    }
}
