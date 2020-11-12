import { ClassExpression, ObjectComplementOf, ObjectIntersectionOf, ObjectUnionOf } from "./ClassExpression";
import { DataAllValuesFrom } from "./DataAllValuesFrom";
import { DataExactCardinality } from "./DataExactCardinality";
import { DataHasValue } from "./DataHasValue";
import { DataMaxCardinality } from "./DataMaxCardinality";
import { DataMinCardinality } from "./DataMinCardinality";
import { DataPropertyRestriction } from "./DataPropertyRestriction";
import { DataSomeValuesFrom } from "./DataSomeValuesFrom";
import { IClassExpression } from "./IClassExpression";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataPropertyRestriction } from "./IDataPropertyRestriction";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
import { IIsClassExpression } from "./IIsClassExpression";
import { IObjectAllValuesFrom } from "./IObjectAllValuesFrom";
import { IObjectExactCardinality, IObjectMaxCardinality, IObjectMinCardinality } from "./IObjectCardinality";
import { IObjectComplementOf } from "./IObjectComplementOf";
import { IObjectHasSelf } from "./IObjectHasSelf";
import { IObjectHasValue } from "./IObjectHasValue";
import { IObjectIntersectionOf } from "./IObjectIntersectionOf";
import { IObjectOneOf } from "./IObjectOneOf";
import { IObjectPropertyRestriction } from "./IObjectPropertyRestriction";
import { IObjectSomeValuesFrom } from "./IObjectSomeValuesFrom";
import { IObjectUnionOf } from "./IObjectUnionOf";
import { IPropertyRestriction } from "./IPropertyRestriction";
import { ObjectAllValuesFrom } from "./ObjectAllValuesFrom";
import { ObjectExactCardinality } from "./ObjectExactCardinality";
import { ObjectHasSelf } from "./ObjectHasSelf";
import { ObjectHasValue } from "./ObjectHasValue";
import { ObjectMaxCardinality } from "./ObjectMaxCardinality";
import { ObjectMinCardinality } from "./ObjectMinCardinality";
import { ObjectOneOf } from "./ObjectOneOf";
import { ObjectPropertyRestriction } from "./ObjectPropertyRestriction";
import { ObjectSomeValuesFrom } from "./ObjectSomeValuesFrom";
import { PropertyRestriction } from "./PropertyRestriction";

export class IsClassExpression implements IIsClassExpression
{
    IClassExpression          (ce: object): ce is IClassExpression           { return ce instanceof ClassExpression          ; }
    IObjectIntersectionOf     (ce: object): ce is IObjectIntersectionOf      { return ce instanceof ObjectIntersectionOf     ; }
    IObjectUnionOf            (ce: object): ce is IObjectUnionOf             { return ce instanceof ObjectUnionOf            ; }
    IObjectComplementOf       (ce: object): ce is IObjectComplementOf        { return ce instanceof ObjectComplementOf       ; }
    IObjectOneOf              (ce: object): ce is IObjectOneOf               { return ce instanceof ObjectOneOf              ; }
    IPropertyRestriction      (ce: object): ce is IPropertyRestriction       { return ce instanceof PropertyRestriction      ; }
    IObjectPropertyRestriction(ce: object): ce is IObjectPropertyRestriction { return ce instanceof ObjectPropertyRestriction; }
    IObjectSomeValuesFrom     (ce: object): ce is IObjectSomeValuesFrom      { return ce instanceof ObjectSomeValuesFrom     ; }
    IObjectAllValuesFrom      (ce: object): ce is IObjectAllValuesFrom       { return ce instanceof ObjectAllValuesFrom      ; }
    IObjectHasValue           (ce: object): ce is IObjectHasValue            { return ce instanceof ObjectHasValue           ; }
    IObjectHasSelf            (ce: object): ce is IObjectHasSelf             { return ce instanceof ObjectHasSelf            ; }
    IObjectMinCardinality     (ce: object): ce is IObjectMinCardinality      { return ce instanceof ObjectMinCardinality     ; }
    IObjectMaxCardinality     (ce: object): ce is IObjectMaxCardinality      { return ce instanceof ObjectMaxCardinality     ; }
    IObjectExactCardinality   (ce: object): ce is IObjectExactCardinality    { return ce instanceof ObjectExactCardinality   ; }
    IDataPropertyRestriction  (ce: object): ce is IDataPropertyRestriction   { return ce instanceof DataPropertyRestriction  ; }
    IDataSomeValuesFrom       (ce: object): ce is IDataSomeValuesFrom        { return ce instanceof DataSomeValuesFrom       ; }
    IDataAllValuesFrom        (ce: object): ce is IDataAllValuesFrom         { return ce instanceof DataAllValuesFrom        ; }
    IDataHasValue             (ce: object): ce is IDataHasValue              { return ce instanceof DataHasValue             ; }
    IDataMinCardinality       (ce: object): ce is IDataMinCardinality        { return ce instanceof DataMinCardinality       ; }
    IDataMaxCardinality       (ce: object): ce is IDataMaxCardinality        { return ce instanceof DataMaxCardinality       ; }
    IDataExactCardinality     (ce: object): ce is IDataExactCardinality      { return ce instanceof DataExactCardinality     ; }
}
