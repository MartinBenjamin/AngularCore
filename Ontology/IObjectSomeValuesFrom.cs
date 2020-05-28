namespace Ontology
{
    public interface IObjectSomeValuesFrom: IClassExpression
    {
        IObjectPropertyExpression ObjectPropertyExpression { get; }
        IClassExpression          ClassExpression          { get; }
    }
}
