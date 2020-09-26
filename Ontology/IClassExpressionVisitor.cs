namespace Ontology
{
    public interface IClassExpressionVisitor
    {
        void Visit(IClass                  @class                );
        void Visit(IDataAllValuesFrom      dataAllValuesFrom     );
        void Visit(IDataMinCardinality     dataMinCardinality    );
        void Visit(IDataMaxCardinality     dataMaxCardinality    );
        void Visit(IDataExactCardinality   dataExactCardinality  );
        void Visit(IDataHasValue           dataHasValue          );
        void Visit(IDataSomeValuesFrom     dataSomeValuesFrom    );
        void Visit(IObjectAllValuesFrom    objectAllValuesFrom   );
        void Visit(IObjectMinCardinality   objectMinCardinality  );
        void Visit(IObjectMaxCardinality   objectMaxCardinality  );
        void Visit(IObjectExactCardinality objectExactCardinality);
        void Visit(IObjectComplementOf     objectComplementOf    );
        void Visit(IObjectHasValue         objectHasValue        );
        void Visit(IObjectIntersectionOf   objectIntersectionOf  );
        void Visit(IObjectOneOf            objectOneOf           );
        void Visit(IObjectSomeValuesFrom   objectSomeValuesFrom  );
        void Visit(IObjectUnionOf          objectUnionOf         );
    }
}
