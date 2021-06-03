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
    Class                 (class$                : IClass                 ): void;
    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  ): void;
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         ): void;
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    ): void;
    ObjectOneOf           (objectOneOf           : IObjectOneOf           ): void;
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  ): void;
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   ): void;
    ObjectHasValue        (objectHasValue        : IObjectHasValue        ): void;
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         ): void;
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  ): void;
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  ): void;
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality): void;
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    ): void;
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     ): void;
    DataHasValue          (dataHasValue          : IDataHasValue          ): void;
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    ): void;
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    ): void;
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  ): void;
}

export class ClassExpressionVisitor implements IClassExpressionVisitor
{
    Class                 (class$                : IClass                 ): void {}
    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  ): void {}
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         ): void {}
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    ): void {}
    ObjectOneOf           (objectOneOf           : IObjectOneOf           ): void {}
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  ): void {}
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   ): void {}
    ObjectHasValue        (objectHasValue        : IObjectHasValue        ): void {}
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         ): void {}
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  ): void {}
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  ): void {}
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality): void {}
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    ): void {}
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     ): void {}
    DataHasValue          (dataHasValue          : IDataHasValue          ): void {}
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    ): void {}
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    ): void {}
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  ): void {}
}
