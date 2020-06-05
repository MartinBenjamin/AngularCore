namespace Ontology
{
    public interface IPropertyRestriction: IClassExpression
    {
        IPropertyExpression PropertyExpression { get; }
    }
}
