namespace Ontology
{
    public interface IDataHasValue: IClassExpression
    {
        IDataPropertyExpression DataPropertyExpression { get; }
        object                  Value                  { get; }
    }
}
