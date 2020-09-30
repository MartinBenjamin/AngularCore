namespace Ontology
{
    public interface IEntity: IAxiom
    {
        string Iri       { get; }
        string LocalName { get; }
    }
}
