import { AnnotationProperty } from "./AnnotationProperty";
import { Axiom } from "./Axiom";
import { Class } from "./Class";
import { DataPropertyDomain } from "./DataPropertyDomain";
import { DisjointClasses } from "./DisjointClasses";
import { Entity } from "./Entity";
import { EquivalentClasses } from "./EquivalentClasses";
import { FunctionalDataProperty } from "./FunctionalDataProperty";
import { HasKey } from "./HasKey";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IDisjointClasses } from "./IDisjointClasses";
import { IEntity } from "./IEntity";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IHasKey } from "./IHasKey";
import { IIsAxiom } from "./IIsAxiom";
import { IClassAssertion, IDataPropertyAssertion, INamedIndividual, IObjectPropertyAssertion } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { ISubClassOf } from "./ISubClassOf";
import { ClassAssertion, DataPropertyAssertion, NamedIndividual, ObjectPropertyAssertion } from "./NamedIndividual";
import { ObjectPropertyDomain } from "./ObjectPropertyDomain";
import { DataPropertyExpression, ObjectPropertyExpression } from "./Property";
import { SubClassOf } from "./SubClassOf";

export class IsAxiom implements IIsAxiom
{
    IAxiom                   (axiom: object): axiom is IAxiom                    { return axiom instanceof Axiom                   ; }
    IEntity                  (axiom: object): axiom is IEntity                   { return axiom instanceof Entity                  ; }
    IClass                   (axiom: object): axiom is IClass                    { return axiom instanceof Class                   ; }
    IObjectPropertyExpression(axiom: object): axiom is IObjectPropertyExpression { return axiom instanceof ObjectPropertyExpression; }
    IDataPropertyExpression  (axiom: object): axiom is IDataPropertyExpression   { return axiom instanceof DataPropertyExpression  ; }
    IAnnotationProperty      (axiom: object): axiom is IAnnotationProperty       { return axiom instanceof AnnotationProperty      ; }
    INamedIndividual         (axiom: object): axiom is INamedIndividual          { return axiom instanceof NamedIndividual         ; }
    IHasKey                  (axiom: object): axiom is IHasKey                   { return axiom instanceof HasKey                  ; }
    ISubClassOf              (axiom: object): axiom is ISubClassOf               { return axiom instanceof SubClassOf              ; }
    IEquivalentClasses       (axiom: object): axiom is IEquivalentClasses        { return axiom instanceof EquivalentClasses       ; }
    IDisjointClasses         (axiom: object): axiom is IDisjointClasses          { return axiom instanceof DisjointClasses         ; }
    IClassAssertion          (axiom: object): axiom is IClassAssertion           { return axiom instanceof ClassAssertion          ; }
    IObjectPropertyAssertion (axiom: object): axiom is IObjectPropertyAssertion  { return axiom instanceof ObjectPropertyAssertion ; }
    IDataPropertyAssertion   (axiom: object): axiom is IDataPropertyAssertion    { return axiom instanceof DataPropertyAssertion   ; }
    IObjectPropertyDomain    (axiom: object): axiom is IObjectPropertyDomain     { return axiom instanceof ObjectPropertyDomain    ; }
    IDataPropertyDomain      (axiom: object): axiom is IDataPropertyDomain       { return axiom instanceof DataPropertyDomain      ; }
    IFunctionalDataProperty  (axiom: object): axiom is IDataPropertyDomain       { return axiom instanceof FunctionalDataProperty  ; }

}
