namespace Ontology
{
    public interface IDataCardinality: IClassExpression
    {
        IDataPropertyExpression  DataPropertyExpression { get; }
        int                      Cardinality            { get; }
        IDataRange               DataRange              { get; }
    }

    public interface IDataMinCardinality: IDataCardinality
    {
    }

    public interface IDataMaxCardinality: IDataCardinality
    {
    }
    public interface IDataExactCardinality: IDataCardinality
    {
    }
}
