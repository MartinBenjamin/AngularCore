namespace Ontology
{
    public interface IClass:
        IEntity,
        IClassExpression
    {
        IClassExpression Definition { get; set; }
    }
}
