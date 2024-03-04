import { IDLSafeRule } from "./DLSafeRule";
import { IAnnotationAssertion } from "./IAnnotationAssertion";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IClassAssertion, IDataPropertyAssertion, IObjectPropertyAssertion } from "./IAssertion";
import { IAxiom } from "./IAxiom";
import { IClassSelector } from './IClass';
import { IDataPropertyDomain } from "./IDataPropertyDomain";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDatatypeSelector } from "./IDatatype";
import { IDisjointClasses } from "./IDisjointClasses";
import { IEntity } from "./IEntity";
import { IEquivalentClasses } from "./IEquivalentClasses";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IFunctionalObjectProperty } from "./IFunctionalObjectProperty";
import { IHasKey } from "./IHasKey";
import { INamedIndividual } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IPropertySelector } from "./IProperty";
import { ISubClassOf } from "./ISubClassOf";

export interface IAxiomSelector<TResult> extends
    IClassSelector<TResult>,
    IPropertySelector<TResult>,
    IDatatypeSelector<TResult>
{
    Axiom                      (axiom                   : IAxiom                   ): TResult;
    Entity                     (entity                  : IEntity                  ): TResult;
    AnnotationProperty         (annotationProperty      : IAnnotationProperty      ): TResult;
    NamedIndividual            (namedIndividual         : INamedIndividual         ): TResult;
    HasKey                     (hasKey                  : IHasKey                  ): TResult;
    SubClassOf                 (subClassOf              : ISubClassOf              ): TResult;
    EquivalentClasses          (equivalentClasses       : IEquivalentClasses       ): TResult;
    DisjointClasses            (disjointClasses         : IDisjointClasses         ): TResult;
    ClassAssertion             (classAssertion          : IClassAssertion          ): TResult;
    ObjectPropertyAssertion    (objectPropertyAssertion : IObjectPropertyAssertion ): TResult;
    DataPropertyAssertion      (dataPropertyAssertion   : IDataPropertyAssertion   ): TResult;
    ObjectPropertyDomain       (objectPropertyDomain    : IObjectPropertyDomain    ): TResult;
    ObjectPropertyRange        (objectPropertyRange     : IObjectPropertyRange     ): TResult;
    DataPropertyDomain         (dataPropertyDomain      : IDataPropertyDomain      ): TResult;
    DataPropertyRange          (dataPropertyRange       : IDataPropertyRange       ): TResult;
    FunctionalObjectProperty   (functionalObjectProperty: IFunctionalObjectProperty): TResult;
    FunctionalDataProperty     (functionalDataProperty  : IFunctionalDataProperty  ): TResult;
    AnnotationAssertion        (annotationAssertion     : IAnnotationAssertion     ): TResult;
    DLSafeRule                 (dlSafeRule              : IDLSafeRule              ): TResult;
}
