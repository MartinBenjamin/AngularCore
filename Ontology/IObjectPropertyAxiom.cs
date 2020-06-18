namespace Ontology
{
    public interface IObjectPropertyAxiom: IAxiom
    {
        IObjectPropertyExpression ObjectPropertyExpression { get; }
    }
}
