namespace Ontology
{
    public interface IObjectHasValue: IObjectPropertyRestriction
    {
        object Individual { get; }
    }
}
