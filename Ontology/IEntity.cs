namespace Ontology
{
    public interface IEntity
    {
        IOntology Ontology { get; }

        string    Name     { get; }
    }
}
