import { IClassExpression } from "./IClassExpression";
import { IDataAllValuesFrom } from "./IDataAllValuesFrom";
import { IDataExactCardinality, IDataMaxCardinality, IDataMinCardinality } from "./IDataCardinality";
import { IDataHasValue } from "./IDataHasValue";
import { IDataPropertyRestriction } from "./IDataPropertyRestriction";
import { IDataSomeValuesFrom } from "./IDataSomeValuesFrom";
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

type TypeGuard<T extends object> = (o: object) => o is T;

export interface IIsClassExpression
{
    IClassExpression          : TypeGuard<IClassExpression          >;
    IObjectIntersectionOf     : TypeGuard<IObjectIntersectionOf     >;
    IObjectUnionOf            : TypeGuard<IObjectUnionOf            >;
    IObjectComplementOf       : TypeGuard<IObjectComplementOf       >;
    IObjectOneOf              : TypeGuard<IObjectOneOf              >;
    IPropertyRestriction      : TypeGuard<IPropertyRestriction      >;
    IObjectPropertyRestriction: TypeGuard<IObjectPropertyRestriction>;
    IObjectSomeValuesFrom     : TypeGuard<IObjectSomeValuesFrom     >;
    IObjectAllValuesFrom      : TypeGuard<IObjectAllValuesFrom      >;
    IObjectHasValue           : TypeGuard<IObjectHasValue           >;
    IObjectHasSelf            : TypeGuard<IObjectHasSelf            >;
    IObjectMinCardinality     : TypeGuard<IObjectMinCardinality     >;
    IObjectMaxCardinality     : TypeGuard<IObjectMaxCardinality     >;
    IObjectExactCardinality   : TypeGuard<IObjectExactCardinality   >;
    IDataPropertyRestriction  : TypeGuard<IDataPropertyRestriction  >;
    IDataSomeValuesFrom       : TypeGuard<IDataSomeValuesFrom       >;
    IDataAllValuesFrom        : TypeGuard<IDataAllValuesFrom        >;
    IDataHasValue             : TypeGuard<IDataHasValue             >;
    IDataMinCardinality       : TypeGuard<IDataMinCardinality       >;
    IDataMaxCardinality       : TypeGuard<IDataMaxCardinality       >;
    IDataExactCardinality     : TypeGuard<IDataExactCardinality     >;
}
