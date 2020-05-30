namespace Ontology
{
    public interface IObjectSomeValuesFrom: IObjectPropertyRestriction
    {
        IClassExpression ClassExpression { get; }
    }
}
