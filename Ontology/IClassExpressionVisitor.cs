namespace Ontology
{
    public interface IClassExpressionVisitor<TResult>
    {
        TResult Visit(IClass                  @class                );
        TResult Visit(IDataAllValuesFrom      dataAllValuesFrom     );
        TResult Visit(IDataMinCardinality     dataMinCardinality    );
        TResult Visit(IDataMaxCardinality     dataMaxCardinality    );
        TResult Visit(IDataExactCardinality   dataExactCardinality  );
        TResult Visit(IDataSomeValuesFrom     dataSomeValuesFrom    );
        TResult Visit(IObjectAllValuesFrom    objectAllValuesFrom   );
        TResult Visit(IObjectMinCardinality   objectMinCardinality  );
        TResult Visit(IObjectMaxCardinality   objectMaxCardinality  );
        TResult Visit(IObjectExactCardinality objectExactCardinality);
        TResult Visit(IObjectComplementOf     objectComplementOf    );
        TResult Visit(IObjectHasValue         objectHasValue        );
        TResult Visit(IObjectIntersectionOf   objectIntersectionOf  );
        TResult Visit(IObjectOneOf            objectOneOf           );
        TResult Visit(IObjectSomeValuesFrom   objectSomeValuesFrom  );
        TResult Visit(IObjectUnionOf          objectUnionOf         );
    }
}
