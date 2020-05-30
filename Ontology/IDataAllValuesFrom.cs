namespace Ontology
{
    public interface IDataAllValuesFrom: IDataPropertyRestriction
    {
        IDataRange DataRange { get; }
    }
}
