namespace Ontology
{
    public interface IClassExpressionVisitor
    {
        void Enter(IClass                  @class                );
        void Exit (IClass                  @class                );
        void Enter(IDataAllValuesFrom      dataAllValuesFrom     );
        void Exit (IDataAllValuesFrom      dataAllValuesFrom     );
        void Enter(IDataMinCardinality     dataMinCardinality    );
        void Exit (IDataMinCardinality     dataMinCardinality    );
        void Enter(IDataMaxCardinality     dataMaxCardinality    );
        void Exit (IDataMaxCardinality     dataMaxCardinality    );
        void Enter(IDataExactCardinality   dataExactCardinality  );
        void Exit (IDataExactCardinality   dataExactCardinality  );
        void Enter(IDataHasValue           dataHasValue          );
        void Exit (IDataHasValue           dataHasValue          );
        void Enter(IDataSomeValuesFrom     dataSomeValuesFrom    );
        void Exit (IDataSomeValuesFrom     dataSomeValuesFrom    );
        void Enter(IObjectAllValuesFrom    objectAllValuesFrom   );
        void Exit (IObjectAllValuesFrom    objectAllValuesFrom   );
        void Enter(IObjectMinCardinality   objectMinCardinality  );
        void Exit (IObjectMinCardinality   objectMinCardinality  );
        void Enter(IObjectMaxCardinality   objectMaxCardinality  );
        void Exit (IObjectMaxCardinality   objectMaxCardinality  );
        void Enter(IObjectExactCardinality objectExactCardinality);
        void Exit (IObjectExactCardinality objectExactCardinality);
        void Enter(IObjectComplementOf     objectComplementOf    );
        void Exit (IObjectComplementOf     objectComplementOf    );
        void Enter(IObjectHasValue         objectHasValue        );
        void Exit (IObjectHasValue         objectHasValue        );
        void Enter(IObjectIntersectionOf   objectIntersectionOf  );
        void Exit (IObjectIntersectionOf   objectIntersectionOf  );
        void Enter(IObjectOneOf            objectOneOf           );
        void Exit (IObjectOneOf            objectOneOf           );
        void Enter(IObjectSomeValuesFrom   objectSomeValuesFrom  );
        void Exit (IObjectSomeValuesFrom   objectSomeValuesFrom  );
        void Enter(IObjectUnionOf          objectUnionOf         );
        void Exit (IObjectUnionOf          objectUnionOf         );
    }
}
