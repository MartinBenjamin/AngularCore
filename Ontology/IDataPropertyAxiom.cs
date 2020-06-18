namespace Ontology
{
    public interface IDataPropertyAxiom: IAxiom
    {
        IDataPropertyExpression DataPropertyExpression { get; }
    }
}
