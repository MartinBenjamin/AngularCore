namespace Ontology
{
    public interface IDataComplementOf: IDataRange
    {
        IDataRange DataRange { get; }
    }
}
