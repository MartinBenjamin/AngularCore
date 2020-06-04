namespace Ontology
{
    public interface ISubClassOf: IClassAxiom
    {
        IClassExpression SubClassExpression   { get; }
        IClassExpression SuperClassExpression { get; }
    }
}
