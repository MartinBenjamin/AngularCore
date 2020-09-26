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

    public class ClassExpressionVisitor: IClassExpressionVisitor
    {
        public virtual void Enter(IClass                  @class                ) {}
        public virtual void Exit (IClass                  @class                ) {}
        public virtual void Enter(IDataAllValuesFrom      dataAllValuesFrom     ) {}
        public virtual void Exit (IDataAllValuesFrom      dataAllValuesFrom     ) {}
        public virtual void Enter(IDataMinCardinality     dataMinCardinality    ) {}
        public virtual void Exit (IDataMinCardinality     dataMinCardinality    ) {}
        public virtual void Enter(IDataMaxCardinality     dataMaxCardinality    ) {}
        public virtual void Exit (IDataMaxCardinality     dataMaxCardinality    ) {}
        public virtual void Enter(IDataExactCardinality   dataExactCardinality  ) {}
        public virtual void Exit (IDataExactCardinality   dataExactCardinality  ) {}
        public virtual void Enter(IDataHasValue           dataHasValue          ) {}
        public virtual void Exit (IDataHasValue           dataHasValue          ) {}
        public virtual void Enter(IDataSomeValuesFrom     dataSomeValuesFrom    ) {}
        public virtual void Exit (IDataSomeValuesFrom     dataSomeValuesFrom    ) {}
        public virtual void Enter(IObjectAllValuesFrom    objectAllValuesFrom   ) {}
        public virtual void Exit (IObjectAllValuesFrom    objectAllValuesFrom   ) {}
        public virtual void Enter(IObjectMinCardinality   objectMinCardinality  ) {}
        public virtual void Exit (IObjectMinCardinality   objectMinCardinality  ) {}
        public virtual void Enter(IObjectMaxCardinality   objectMaxCardinality  ) {}
        public virtual void Exit (IObjectMaxCardinality   objectMaxCardinality  ) {}
        public virtual void Enter(IObjectExactCardinality objectExactCardinality) {}
        public virtual void Exit (IObjectExactCardinality objectExactCardinality) {}
        public virtual void Enter(IObjectComplementOf     objectComplementOf    ) {}
        public virtual void Exit (IObjectComplementOf     objectComplementOf    ) {}
        public virtual void Enter(IObjectHasValue         objectHasValue        ) {}
        public virtual void Exit (IObjectHasValue         objectHasValue        ) {}
        public virtual void Enter(IObjectIntersectionOf   objectIntersectionOf  ) {}
        public virtual void Exit (IObjectIntersectionOf   objectIntersectionOf  ) {}
        public virtual void Enter(IObjectOneOf            objectOneOf           ) {}
        public virtual void Exit (IObjectOneOf            objectOneOf           ) {}
        public virtual void Enter(IObjectSomeValuesFrom   objectSomeValuesFrom  ) {}
        public virtual void Exit (IObjectSomeValuesFrom   objectSomeValuesFrom  ) {}
        public virtual void Enter(IObjectUnionOf          objectUnionOf         ) {}
        public virtual void Exit (IObjectUnionOf          objectUnionOf         ) {}
    }
}
