namespace Ontology
{
    public interface IObjectPropertyRestriction: IClassExpression
    {
        IObjectPropertyExpression ObjectPropertyExpression { get; }
    }
}
