namespace Ontology
{
    public interface IDataPropertyRestriction: IClassExpression
    {
        IDataPropertyExpression DataPropertyExpression { get; }
    }
}
