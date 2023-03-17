import { IClassSelector } from "./IClass";
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

export interface IClassExpressionSelector<TResult> extends IClassSelector<TResult>
{
    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  ): TResult;
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         ): TResult;
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    ): TResult;
    ObjectOneOf           (objectOneOf           : IObjectOneOf           ): TResult;
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  ): TResult;
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   ): TResult;
    ObjectHasValue        (objectHasValue        : IObjectHasValue        ): TResult;
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         ): TResult;
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  ): TResult;
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  ): TResult;
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality): TResult;
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    ): TResult;
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     ): TResult;
    DataHasValue          (dataHasValue          : IDataHasValue          ): TResult;
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    ): TResult;
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    ): TResult;
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  ): TResult;
}
