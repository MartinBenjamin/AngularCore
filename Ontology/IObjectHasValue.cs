namespace Ontology
{
    public interface IObjectHasValue: IClassExpression
    {
        IObjectPropertyExpression ObjectPropertyExpression { get; }
        object                    Individual               { get; }
    }
}
