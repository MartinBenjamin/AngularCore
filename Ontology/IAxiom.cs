namespace Ontology
{
    public interface IAxiom: IAnnotated
    {
        IOntology Ontology { get; }
    }
}
