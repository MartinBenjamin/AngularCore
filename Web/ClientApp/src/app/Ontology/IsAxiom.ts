import { AnnotationAssertion } from "./AnnotationAssertion";
import { AnnotationProperty } from "./AnnotationProperty";
import { ClassAssertion, DataPropertyAssertion, ObjectPropertyAssertion } from "./Assertion";
import { Axiom } from "./Axiom";
import { Class } from "./Class";
import { DataPropertyDomain } from "./DataPropertyDomain";
import { DataPropertyRange } from "./DataPropertyRange";
import { DisjointClasses } from "./DisjointClasses";
import { Entity } from "./Entity";
import { EquivalentClasses } from "./EquivalentClasses";
import { FunctionalDataProperty } from "./FunctionalDataProperty";
import { FunctionalObjectProperty } from "./FunctionalObjectProperty";
import { HasKey } from "./HasKey";
import { IAnnotationAssertion } from "./IAnnotationAssertion";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IClassAssertion, IDataPropertyAssertion, IObjectPropertyAssertion } from "./IAssertion";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDisjointClasses } from "./IDisjointClasses";
import { IEntity } from "./IEntity";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IFunctionalObjectProperty } from "./IFunctionalObjectProperty";
import { IHasKey } from "./IHasKey";
import { IIsAxiom } from "./IIsAxiom";
import { INamedIndividual } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IDataProperty, IObjectProperty } from "./IProperty";
import { ISubClassOf } from "./ISubClassOf";
import { NamedIndividual } from "./NamedIndividual";
import { ObjectPropertyDomain } from "./ObjectPropertyDomain";
import { ObjectPropertyRange } from "./ObjectPropertyRange";
import { DataProperty, ObjectProperty } from "./Property";
import { SubClassOf } from "./SubClassOf";

export class IsAxiom implements IIsAxiom
{
    IAxiom                   (axiom: object): axiom is IAxiom                    { return axiom instanceof Axiom                   ; }
    IEntity                  (axiom: object): axiom is IEntity                   { return axiom instanceof Entity                  ; }
    IClass                   (axiom: object): axiom is IClass                    { return axiom instanceof Class                   ; }
    IObjectProperty          (axiom: object): axiom is IObjectProperty           { return axiom instanceof ObjectProperty          ; }
    IDataProperty            (axiom: object): axiom is IDataProperty             { return axiom instanceof DataProperty            ; }
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
    IObjectPropertyRange     (axiom: object): axiom is IObjectPropertyRange      { return axiom instanceof ObjectPropertyRange     ; }
    IDataPropertyDomain      (axiom: object): axiom is IDataPropertyDomain       { return axiom instanceof DataPropertyDomain      ; }
    IDataPropertyRange       (axiom: object): axiom is IDataPropertyRange        { return axiom instanceof DataPropertyRange       ; }
    IFunctionalObjectProperty(axiom: object): axiom is IFunctionalObjectProperty { return axiom instanceof FunctionalObjectProperty; }
    IFunctionalDataProperty  (axiom: object): axiom is IFunctionalDataProperty   { return axiom instanceof FunctionalDataProperty  ; }
    IAnnotationAssertion     (axiom: object): axiom is IAnnotationAssertion      { return axiom instanceof AnnotationAssertion     ; }
}
