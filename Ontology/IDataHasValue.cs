namespace Ontology
{
    public interface IDataHasValue: IDataPropertyRestriction
    {
        object Value { get; }
    }
}
