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
import { EquivalentDataProperties } from "./EquivalentDataProperties";
import { EquivalentObjectProperties } from "./EquivalentObjectProperties";
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
import { IEquivalentDataProperties } from "./IEquivalentDataProperties";
import { IEquivalentObjectProperties } from "./IEquivalentObjectProperties";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IFunctionalObjectProperty } from "./IFunctionalObjectProperty";
import { IHasKey } from "./IHasKey";
import { IInverseObjectProperties } from "./IInverseObjectProperties";
import { IIsAxiom } from "./IIsAxiom";
import { INamedIndividual } from "./INamedIndividual";
import { InverseObjectProperties } from "./InverseObjectProperties";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IDataProperty, IObjectProperty } from "./IProperty";
import { IReflexiveObjectProperty } from "./IReflexiveObjectProperty";
import { ISubClassOf } from "./ISubClassOf";
import { ISubDataPropertyOf } from "./ISubDataPropertyOf";
import { ISubObjectPropertyOf } from "./ISubObjectPropertyOf";
import { ISymmetricObjectProperty } from "./ISymmetricObjectProperty";
import { ITransitiveObjectProperty } from "./ITransitiveObjectProperty";
import { NamedIndividual } from "./NamedIndividual";
import { ObjectPropertyDomain } from "./ObjectPropertyDomain";
import { ObjectPropertyRange } from "./ObjectPropertyRange";
import { DataProperty, ObjectProperty } from "./Property";
import { ReflexiveObjectProperty } from "./ReflexiveObjectProperty";
import { SubClassOf } from "./SubClassOf";
import { SubDataPropertyOf } from "./SubDataPropertyOf";
import { SubObjectPropertyOf } from "./SubObjectPropertyOf";
import { SymmetricObjectProperty } from "./SymmetricObjectProperty";
import { TransitiveObjectProperty } from "./TransitiveObjectProperty";

export class IsAxiom implements IIsAxiom
{
    IAxiom                     (axiom: object): axiom is IAxiom                      { return axiom instanceof Axiom                     ; }
    IEntity                    (axiom: object): axiom is IEntity                     { return axiom instanceof Entity                    ; }
    IClass                     (axiom: object): axiom is IClass                      { return axiom instanceof Class                     ; }
    IObjectProperty            (axiom: object): axiom is IObjectProperty             { return axiom instanceof ObjectProperty            ; }
    IDataProperty              (axiom: object): axiom is IDataProperty               { return axiom instanceof DataProperty              ; }
    IAnnotationProperty        (axiom: object): axiom is IAnnotationProperty         { return axiom instanceof AnnotationProperty        ; }
    INamedIndividual           (axiom: object): axiom is INamedIndividual            { return axiom instanceof NamedIndividual           ; }
    IHasKey                    (axiom: object): axiom is IHasKey                     { return axiom instanceof HasKey                    ; }
    ISubClassOf                (axiom: object): axiom is ISubClassOf                 { return axiom instanceof SubClassOf                ; }
    IEquivalentClasses         (axiom: object): axiom is IEquivalentClasses          { return axiom instanceof EquivalentClasses         ; }
    IDisjointClasses           (axiom: object): axiom is IDisjointClasses            { return axiom instanceof DisjointClasses           ; }
    IClassAssertion            (axiom: object): axiom is IClassAssertion             { return axiom instanceof ClassAssertion            ; }
    IObjectPropertyAssertion   (axiom: object): axiom is IObjectPropertyAssertion    { return axiom instanceof ObjectPropertyAssertion   ; }
    IDataPropertyAssertion     (axiom: object): axiom is IDataPropertyAssertion      { return axiom instanceof DataPropertyAssertion     ; }
    ISubObjectPropertyOf       (axiom: object): axiom is ISubObjectPropertyOf        { return axiom instanceof SubObjectPropertyOf       ; }
    IEquivalentObjectProperties(axiom: object): axiom is IEquivalentObjectProperties { return axiom instanceof EquivalentObjectProperties; }
    IInverseObjectProperties   (axiom: object): axiom is IInverseObjectProperties    { return axiom instanceof InverseObjectProperties   ; }
    IObjectPropertyDomain      (axiom: object): axiom is IObjectPropertyDomain       { return axiom instanceof ObjectPropertyDomain      ; }
    IObjectPropertyRange       (axiom: object): axiom is IObjectPropertyRange        { return axiom instanceof ObjectPropertyRange       ; }
    IFunctionalObjectProperty  (axiom: object): axiom is IFunctionalObjectProperty   { return axiom instanceof FunctionalObjectProperty  ; }
    IReflexiveObjectProperty   (axiom: object): axiom is IReflexiveObjectProperty    { return axiom instanceof ReflexiveObjectProperty   ; }
    ISymmetricObjectProperty   (axiom: object): axiom is ISymmetricObjectProperty    { return axiom instanceof SymmetricObjectProperty   ; }
    ITransitiveObjectProperty  (axiom: object): axiom is ITransitiveObjectProperty   { return axiom instanceof TransitiveObjectProperty  ; }
    ISubDataPropertyOf         (axiom: object): axiom is ISubDataPropertyOf          { return axiom instanceof SubDataPropertyOf         ; }
    IEquivalentDataProperties  (axiom: object): axiom is IEquivalentDataProperties   { return axiom instanceof EquivalentDataProperties  ; }
    IDataPropertyDomain        (axiom: object): axiom is IDataPropertyDomain         { return axiom instanceof DataPropertyDomain        ; }
    IDataPropertyRange         (axiom: object): axiom is IDataPropertyRange          { return axiom instanceof DataPropertyRange         ; }
    IFunctionalDataProperty    (axiom: object): axiom is IFunctionalDataProperty     { return axiom instanceof FunctionalDataProperty    ; }
    IAnnotationAssertion       (axiom: object): axiom is IAnnotationAssertion        { return axiom instanceof AnnotationAssertion       ; }
}
