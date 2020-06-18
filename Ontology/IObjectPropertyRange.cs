namespace Ontology
{
    public interface IObjectPropertyRange: IObjectPropertyAxiom
    {
        IClassExpression Range { get; }
    }
}
