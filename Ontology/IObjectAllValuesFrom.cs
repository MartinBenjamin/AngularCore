namespace Ontology
{
    public interface IObjectAllValuesFrom: IClassExpression
    {
        IObjectPropertyExpression ObjectPropertyExpression { get; }
        IClassExpression          ClassExpression { get; }
    }
}
