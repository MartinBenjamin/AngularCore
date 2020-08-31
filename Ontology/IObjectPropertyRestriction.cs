namespace Ontology
{
    public interface IObjectPropertyRestriction: IPropertyRestriction
    {
        IObjectPropertyExpression ObjectPropertyExpression { get; }
    }
}
