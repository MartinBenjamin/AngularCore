import { IAnnotationAssertion } from "./IAnnotationAssertion";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDisjointClasses } from "./IDisjointClasses";
import { IEntity } from "./IEntity";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IHasKey } from "./IHasKey";
import { IClassAssertion, IDataPropertyAssertion, INamedIndividual, IObjectPropertyAssertion } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";

type TypeGuard<T extends object> = (o: object) => o is T;

export interface IIsAxiom
{
    IAxiom                   : TypeGuard<IAxiom                   >;
    IEntity                  : TypeGuard<IEntity                  >;
    IClass                   : TypeGuard<IClass                   >;
    IObjectPropertyExpression: TypeGuard<IObjectPropertyExpression>;
    IDataPropertyExpression  : TypeGuard<IDataPropertyExpression  >;
    IAnnotationProperty      : TypeGuard<IAnnotationProperty      >;
    INamedIndividual         : TypeGuard<INamedIndividual         >;
    IHasKey                  : TypeGuard<IHasKey                  >;
    ISubClassOf              : TypeGuard<ISubClassOf              >;
    IEquivalentClasses       : TypeGuard<IEquivalentClasses       >;
    IDisjointClasses         : TypeGuard<IDisjointClasses         >;
    IClassAssertion          : TypeGuard<IClassAssertion          >;
    IObjectPropertyAssertion : TypeGuard<IObjectPropertyAssertion >;
    IDataPropertyAssertion   : TypeGuard<IDataPropertyAssertion   >;
    IObjectPropertyDomain    : TypeGuard<IObjectPropertyDomain    >;
    IObjectPropertyRange     : TypeGuard<IObjectPropertyRange     >;
    IDataPropertyDomain      : TypeGuard<IDataPropertyDomain      >;
    IDataPropertyRange       : TypeGuard<IDataPropertyRange       >;
    IFunctionalDataProperty  : TypeGuard<IFunctionalDataProperty  >;
    IAnnotationAssertion     : TypeGuard<IAnnotationAssertion     >;
}
