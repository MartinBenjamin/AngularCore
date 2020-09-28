namespace Ontology
{
    public interface IClassMembershipEvaluator
    {
        bool Evaluate(IClass                  @class                , object individual);
        bool Evaluate(IObjectIntersectionOf   objectIntersectionOf  , object individual);
        bool Evaluate(IObjectUnionOf          objectUnionOf         , object individual);
        bool Evaluate(IObjectComplementOf     objectComplementOf    , object individual);
        bool Evaluate(IObjectOneOf            objectOneOf           , object individual);
        bool Evaluate(IObjectSomeValuesFrom   objectSomeValuesFrom  , object individual);
        bool Evaluate(IObjectAllValuesFrom    objectAllValuesFrom   , object individual);
        bool Evaluate(IObjectHasValue         objectHasValue        , object individual);
        bool Evaluate(IObjectHasSelf          objectHasSelf         , object individual);
        bool Evaluate(IObjectMinCardinality   objectMinCardinality  , object individual);
        bool Evaluate(IObjectMaxCardinality   objectMaxCardinality  , object individual);
        bool Evaluate(IObjectExactCardinality objectExactCardinality, object individual);
        bool Evaluate(IDataSomeValuesFrom     dataSomeValuesFrom    , object individual);
        bool Evaluate(IDataAllValuesFrom      dataAllValuesFrom     , object individual);
        bool Evaluate(IDataHasValue           dataHasValue          , object individual);
        bool Evaluate(IDataMinCardinality     dataMinCardinality    , object individual);
        bool Evaluate(IDataMaxCardinality     dataMaxCardinality    , object individual);
        bool Evaluate(IDataExactCardinality   dataExactCardinality  , object individual);
    }
}
