namespace Ontology
{
    public interface IDataSomeValuesFrom: IDataPropertyRestriction
    {
        IDataRange DataRange { get; }
    }
}
