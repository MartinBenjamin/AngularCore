namespace Ontology
{
    public interface IObjectPropertyDomain: IObjectPropertyAxiom
    {
        IClassExpression Domain { get; }
    }
}
