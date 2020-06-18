namespace Ontology
{
    public interface IDataPropertyDomain: IDataPropertyAxiom
    {
        IClassExpression Domain { get; }
    }
}
