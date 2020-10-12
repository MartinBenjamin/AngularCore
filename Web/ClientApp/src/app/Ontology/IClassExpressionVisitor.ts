import { IClass } from "./IClass";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";

export interface IClassExpressionVisitor
{
    Class                 (class$                : IClass                 );
    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  );
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         );
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    );
    ObjectOneOf           (objectOneOf           : IObjectOneOf           );
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  );
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   );
    ObjectHasValue        (objectHasValue        : IObjectHasValue        );
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         );
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  );
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  );
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality);
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    );
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     );
    DataHasValue          (dataHasValue          : IDataHasValue          );
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    );
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    );
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  );
}

export class ClassExpressionVisitor implements IClassExpressionVisitor
{
    Class                 (class$                : IClass                 ) {}
    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  ) {}
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         ) {}
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    ) {}
    ObjectOneOf           (objectOneOf           : IObjectOneOf           ) {}
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  ) {}
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   ) {}
    ObjectHasValue        (objectHasValue        : IObjectHasValue        ) {}
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         ) {}
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  ) {}
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  ) {}
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality) {}
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    ) {}
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     ) {}
    DataHasValue          (dataHasValue          : IDataHasValue          ) {}
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    ) {}
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    ) {}
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  ) {}
}
