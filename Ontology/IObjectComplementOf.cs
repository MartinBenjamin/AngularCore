namespace Ontology
{
    public interface IObjectComplementOf: IClassExpression
    {
        IClassExpression ClassExpression { get; }
    }
}
