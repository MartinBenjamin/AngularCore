import { IAnnotationProperty } from "./IAnnotationProperty";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IDisjointClasses } from "./IDisjointClasses";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IHasKey } from "./IHasKey";
import { IClassAssertion, IDataPropertyAssertion, INamedIndividual, IObjectPropertyAssertion } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";

export interface IIsAxiom
{
    IClass                   (axiom: IAxiom): axiom is IClass;
    IObjectPropertyExpression(axiom: IAxiom): axiom is IObjectPropertyExpression;
    IDataPropertyExpression  (axiom: IAxiom): axiom is IDataPropertyExpression;
    IAnnotationProperty      (axiom: IAxiom): axiom is IAnnotationProperty;
    INamedIndividual         (axiom: object): axiom is INamedIndividual;
    IHasKey                  (axiom: IAxiom): axiom is IHasKey;
    ISubClassOf              (axiom: IAxiom): axiom is ISubClassOf;
    IEquivalentClasses       (axiom: IAxiom): axiom is IEquivalentClasses;
    IDisjointClasses         (axiom: IAxiom): axiom is IDisjointClasses;
    IClassAssertion          (axiom: IAxiom): axiom is IClassAssertion;
    IObjectPropertyAssertion (axiom: IAxiom): axiom is IObjectPropertyAssertion;
    IDataPropertyAssertion   (axiom: IAxiom): axiom is IDataPropertyAssertion;
    IObjectPropertyDomain    (axiom: IAxiom): axiom is IObjectPropertyDomain;
    IDataPropertyDomain      (axiom: IAxiom): axiom is IDataPropertyDomain;
}
