import { IClass } from "./IClass";
import { IClassMembershipEvaluator } from "./IClassMembershipEvaluator";
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

export class ClassMembershipEvaluator implements IClassMembershipEvaluator
{
    Class                 (class$                : IClass                 , individual: object): boolean { return false; }
    ObjectIntersectionOf  (objectIntersectionOf  : IObjectIntersectionOf  , individual: object): boolean { return false; }
    ObjectUnionOf         (objectUnionOf         : IObjectUnionOf         , individual: object): boolean { return false; }
    ObjectComplementOf    (objectComplementOf    : IObjectComplementOf    , individual: object): boolean { return false; }
    ObjectOneOf           (objectOneOf           : IObjectOneOf           , individual: object): boolean { return false; }
    ObjectSomeValuesFrom  (objectSomeValuesFrom  : IObjectSomeValuesFrom  , individual: object): boolean { return false; }
    ObjectAllValuesFrom   (objectAllValuesFrom   : IObjectAllValuesFrom   , individual: object): boolean { return false; }
    ObjectHasValue        (objectHasValue        : IObjectHasValue        , individual: object): boolean { return false; }
    ObjectHasSelf         (objectHasSelf         : IObjectHasSelf         , individual: object): boolean { return false; }
    ObjectMinCardinality  (objectMinCardinality  : IObjectMinCardinality  , individual: object): boolean { return false; }
    ObjectMaxCardinality  (objectMaxCardinality  : IObjectMaxCardinality  , individual: object): boolean { return false; }
    ObjectExactCardinality(objectExactCardinality: IObjectExactCardinality, individual: object): boolean { return false; }
    DataSomeValuesFrom    (dataSomeValuesFrom    : IDataSomeValuesFrom    , individual: object): boolean { return false; }
    DataAllValuesFrom     (dataAllValuesFrom     : IDataAllValuesFrom     , individual: object): boolean { return false; }
    DataHasValue          (dataHasValue          : IDataHasValue          , individual: object): boolean { return false; }
    DataMinCardinality    (dataMinCardinality    : IDataMinCardinality    , individual: object): boolean { return false; }
    DataMaxCardinality    (dataMaxCardinality    : IDataMaxCardinality    , individual: object): boolean { return false; }
    DataExactCardinality  (dataExactCardinality  : IDataExactCardinality  , individual: object): boolean { return false; }

}
