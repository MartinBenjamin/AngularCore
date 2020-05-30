namespace Ontology
{
    public interface IObjectAllValuesFrom: IObjectPropertyRestriction
    {
        IClassExpression ClassExpression { get; }
    }
}
