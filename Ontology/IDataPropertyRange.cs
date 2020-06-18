namespace Ontology
{
    public interface IDataPropertyRange: IDataPropertyAxiom
    {
        IDataRange Range { get; }
    }
}
