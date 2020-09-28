namespace Ontology
{
    public interface IClassExpressionVisitor
    {
        void Visit(IClass                  @class                );
        void Visit(IObjectIntersectionOf   objectIntersectionOf  );
        void Visit(IObjectUnionOf          objectUnionOf         );
        void Visit(IObjectComplementOf     objectComplementOf    );
        void Visit(IObjectOneOf            objectOneOf           );
        void Visit(IObjectSomeValuesFrom   objectSomeValuesFrom  );
        void Visit(IObjectAllValuesFrom    objectAllValuesFrom   );
        void Visit(IObjectHasValue         objectHasValue        );
        void Visit(IObjectHasSelf          objectHasSelf         );
        void Visit(IObjectMinCardinality   objectMinCardinality  );
        void Visit(IObjectMaxCardinality   objectMinCardinality  );
        void Visit(IObjectExactCardinality objectExactCardinality);
        void Visit(IDataSomeValuesFrom     dataSomeValuesFrom    );
        void Visit(IDataAllValuesFrom      dataAllValuesFrom     );
        void Visit(IDataHasValue           dataHasValue          );
        void Visit(IDataMinCardinality     dataMinCardinality    );
        void Visit(IDataMaxCardinality     dataMaxCardinality    );
        void Visit(IDataExactCardinality   dataExactCardinality  );
    }

    public class ClassExpressionVisitor: IClassExpressionVisitor
    {
        public virtual void Visit(IClass                  @class                ) {}
        public virtual void Visit(IObjectIntersectionOf   objectIntersectionOf  ) {}
        public virtual void Visit(IObjectUnionOf          objectUnionOf         ) {}
        public virtual void Visit(IObjectComplementOf     objectComplementOf    ) {}
        public virtual void Visit(IObjectOneOf            objectOneOf           ) {}
        public virtual void Visit(IObjectSomeValuesFrom   objectSomeValuesFrom  ) {}
        public virtual void Visit(IObjectAllValuesFrom    objectAllValuesFrom   ) {}
        public virtual void Visit(IObjectHasValue         objectHasValue        ) {}
        public virtual void Visit(IObjectHasSelf          objectHasSelf         ) {}
        public virtual void Visit(IObjectMinCardinality   objectMinCardinality  ) {}
        public virtual void Visit(IObjectMaxCardinality   objectMaxCardinality  ) {}
        public virtual void Visit(IObjectExactCardinality objectExactCardinality) {}
        public virtual void Visit(IDataSomeValuesFrom     dataSomeValuesFrom    ) {}
        public virtual void Visit(IDataAllValuesFrom      dataAllValuesFrom     ) {}
        public virtual void Visit(IDataHasValue           dataHasValue          ) {}
        public virtual void Visit(IDataMinCardinality     dataMinCardinality    ) {}
        public virtual void Visit(IDataMaxCardinality     dataMaxCardinality    ) {}
        public virtual void Visit(IDataExactCardinality   dataExactCardinality  ) {}
    }
}
