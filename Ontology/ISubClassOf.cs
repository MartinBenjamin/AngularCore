namespace Ontology
{
    public interface ISubClassOf
    {
        IClassExpression SubClassExpression   { get; }
        IClassExpression SuperClassExpression { get; }

        bool Validate(object individual);
    }
}
