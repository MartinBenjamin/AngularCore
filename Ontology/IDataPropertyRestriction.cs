namespace Ontology
{
    public interface IDataPropertyRestriction: IPropertyRestriction
    {
        IDataPropertyExpression DataPropertyExpression { get; }
    }
}
