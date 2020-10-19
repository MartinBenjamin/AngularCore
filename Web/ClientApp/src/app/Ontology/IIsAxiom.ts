import { IAnnotationProperty } from "./IAnnotationProperty";
import { IClass } from "./IClass";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IDisjointClasses } from "./IDisjointClasses";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IHasKey } from "./IHasKey";
import { IClassAssertion, IDataPropertyAssertion, INamedIndividual, IObjectPropertyAssertion } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";
import { IEntity } from "./IEntity";

export interface IIsAxiom2
{
    IClass                   (axiom: object): axiom is IClass;
    IObjectPropertyExpression(axiom: object): axiom is IObjectPropertyExpression;
    IDataPropertyExpression  (axiom: object): axiom is IDataPropertyExpression;
    IAnnotationProperty      (axiom: object): axiom is IAnnotationProperty;
    INamedIndividual         (axiom: object): axiom is INamedIndividual;
    IHasKey                  (axiom: object): axiom is IHasKey;
    ISubClassOf              (axiom: object): axiom is ISubClassOf;
    IEquivalentClasses       (axiom: object): axiom is IEquivalentClasses;
    IDisjointClasses         (axiom: object): axiom is IDisjointClasses;
    IClassAssertion          (axiom: object): axiom is IClassAssertion;
    IObjectPropertyAssertion (axiom: object): axiom is IObjectPropertyAssertion;
    IDataPropertyAssertion   (axiom: object): axiom is IDataPropertyAssertion;
    IObjectPropertyDomain    (axiom: object): axiom is IObjectPropertyDomain;
    IDataPropertyDomain      (axiom: object): axiom is IDataPropertyDomain;
}

type TypeGuard<T extends object> = (o: object) => o is T;

export interface IIsAxiom
{
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
    IDataPropertyDomain      : TypeGuard<IDataPropertyDomain      >;
}
