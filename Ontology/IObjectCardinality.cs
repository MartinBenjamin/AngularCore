namespace Ontology
{
    public interface IObjectCardinality: IObjectPropertyRestriction
    {
        int              Cardinality     { get; }
        IClassExpression ClassExpression { get; }
    }

    public interface IObjectMinCardinality: IObjectCardinality
    {
    }

    public interface IObjectMaxCardinality: IObjectCardinality
    {
    }

    public interface IObjectExactCardinality: IObjectCardinality
    {
    }
}
