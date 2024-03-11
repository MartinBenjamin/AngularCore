import { IDLSafeRule } from "./DLSafeRule";
import { IAnnotationAssertion } from "./IAnnotationAssertion";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IClassAssertion, IDataPropertyAssertion, IObjectPropertyAssertion } from "./IAssertion";
import { IAxiom } from "./IAxiom";
import { IClassVisitor } from "./IClass";
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDatatypeVisitor } from "./IDatatype";
import { IDisjointClasses } from "./IDisjointClasses";
import { IEntity } from "./IEntity";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IEquivalentDataProperties } from "./IEquivalentDataProperties";
import { IEquivalentObjectProperties } from "./IEquivalentObjectProperties";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IFunctionalObjectProperty } from "./IFunctionalObjectProperty";
import { IHasKey } from "./IHasKey";
import { IInverseObjectProperties } from "./IInverseObjectProperties";
import { INamedIndividual } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IPropertyVisitor } from "./IProperty";
import { IReflexiveObjectProperty } from "./IReflexiveObjectProperty";
import { ISubClassOf } from "./ISubClassOf";
import { ISubDataPropertyOf } from "./ISubDataPropertyOf";
import { ISubObjectPropertyOf } from "./ISubObjectPropertyOf";
import { ISymmetricObjectProperty } from "./ISymmetricObjectProperty";
import { ITransitiveObjectProperty } from "./ITransitiveObjectProperty";

export interface IAxiomVisitor extends
    IClassVisitor,
    IPropertyVisitor,
    IDatatypeVisitor
{
    Axiom                      (axiom                     : IAxiom                     ): void;
    Entity                     (entity                    : IEntity                    ): void;
    AnnotationProperty         (annotationProperty        : IAnnotationProperty        ): void;
    NamedIndividual            (namedIndividual           : INamedIndividual           ): void;
    HasKey                     (hasKey                    : IHasKey                    ): void;
    SubClassOf                 (subClassOf                : ISubClassOf                ): void;
    EquivalentClasses          (equivalentClasses         : IEquivalentClasses         ): void;
    DisjointClasses            (disjointClasses           : IDisjointClasses           ): void;
    ClassAssertion             (classAssertion            : IClassAssertion            ): void;
    ObjectPropertyAssertion    (objectPropertyAssertion   : IObjectPropertyAssertion   ): void;
    DataPropertyAssertion      (dataPropertyAssertion     : IDataPropertyAssertion     ): void;
    SubObjectPropertyOf        (subObjectPropertyOf       : ISubObjectPropertyOf       ): void;
    EquivalentObjectProperties (equivalentObjectProperties: IEquivalentObjectProperties): void;
    InverseObjectProperties    (inverseObjectProperties   : IInverseObjectProperties   ): void;
    ObjectPropertyDomain       (objectPropertyDomain      : IObjectPropertyDomain      ): void;
    ObjectPropertyRange        (objectPropertyRange       : IObjectPropertyRange       ): void;
    FunctionalObjectProperty   (functionalObjectProperty  : IFunctionalObjectProperty  ): void;
    ReflexiveObjectProperty    (reflexiveObjectProperty   : IReflexiveObjectProperty   ): void;
    SymmetricObjectProperty    (symmetricObjectProperty   : ISymmetricObjectProperty   ): void;
    TransitiveObjectProperty   (transitiveObjectProperty  : ITransitiveObjectProperty  ): void;
    SubDataPropertyOf          (subDataPropertyOf         : ISubDataPropertyOf         ): void;
    EquivalentDataProperties   (equivalentDataProperties  : IEquivalentDataProperties  ): void;
    DataPropertyDomain         (dataPropertyDomain        : IDataPropertyDomain        ): void;
    DataPropertyRange          (dataPropertyRange         : IDataPropertyRange         ): void;
    FunctionalDataProperty     (functionalDataProperty    : IFunctionalDataProperty    ): void;
    AnnotationAssertion        (annotationAssertion       : IAnnotationAssertion       ): void;
    DLSafeRule                 (dlSafeRule                : IDLSafeRule                ): void;
}
