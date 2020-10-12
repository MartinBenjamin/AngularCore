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

export interface IClassMembershipEvaluator
{
    Class                 (class$                : IClass                 , individual: object): boolean;
    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  , individual: object): boolean;
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         , individual: object): boolean;
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    , individual: object): boolean;
    ObjectOneOf           (objectOneOf           : IObjectOneOf           , individual: object): boolean;                                   
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  , individual: object): boolean;
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   , individual: object): boolean;
    ObjectHasValue        (objectHasValue        : IObjectHasValue        , individual: object): boolean;
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         , individual: object): boolean;
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  , individual: object): boolean;
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  , individual: object): boolean;
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality, individual: object): boolean;
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    , individual: object): boolean;
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     , individual: object): boolean;
    DataHasValue          (dataHasValue          : IDataHasValue          , individual: object): boolean;
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    , individual: object): boolean;
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    , individual: object): boolean;
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  , individual: object): boolean;
}
