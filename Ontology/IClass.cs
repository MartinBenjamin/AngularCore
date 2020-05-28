namespace Ontology
{
    public interface IClass:
        IEntity,
        IClassExpression
    {
        bool AreEqual(
            object lhs,
            object rhs);
    }
}
