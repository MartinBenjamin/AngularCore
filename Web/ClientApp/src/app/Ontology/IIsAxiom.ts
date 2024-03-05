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
import { IEquivalentObjectProperties } from "./IEquivalentObjectProperties";
import { IFunctionalDataProperty } from "./IFunctionalDataProperty";
import { IFunctionalObjectProperty } from "./IFunctionalObjectProperty";
import { IHasKey } from "./IHasKey";
import { IInverseObjectProperties } from "./IInverseObjectProperties";
import { INamedIndividual } from "./INamedIndividual";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";
import { IObjectPropertyRange } from "./IObjectPropertyRange";
import { IDataProperty, IObjectProperty } from "./IProperty";
import { ISubClassOf } from "./ISubClassOf";
import { ISubObjectPropertyOf } from "./ISubObjectPropertyOf";

type TypeGuard<T extends object> = (o: object) => o is T;

export interface IIsAxiom
{
    IAxiom                     : TypeGuard<IAxiom                     >;
    IEntity                    : TypeGuard<IEntity                    >;
    IClass                     : TypeGuard<IClass                     >;
    IObjectProperty            : TypeGuard<IObjectProperty            >;
    IDataProperty              : TypeGuard<IDataProperty              >;
    IAnnotationProperty        : TypeGuard<IAnnotationProperty        >;
    INamedIndividual           : TypeGuard<INamedIndividual           >;
    IHasKey                    : TypeGuard<IHasKey                    >;
    ISubClassOf                : TypeGuard<ISubClassOf                >;
    IEquivalentClasses         : TypeGuard<IEquivalentClasses         >;
    IDisjointClasses           : TypeGuard<IDisjointClasses           >;
    IClassAssertion            : TypeGuard<IClassAssertion            >;
    IObjectPropertyAssertion   : TypeGuard<IObjectPropertyAssertion   >;
    IDataPropertyAssertion     : TypeGuard<IDataPropertyAssertion     >;
    ISubObjectPropertyOf       : TypeGuard<ISubObjectPropertyOf       >;
    IEquivalentObjectProperties: TypeGuard<IEquivalentObjectProperties>;
    IInverseObjectProperties   : TypeGuard<IInverseObjectProperties   >;
    IObjectPropertyDomain      : TypeGuard<IObjectPropertyDomain      >;
    IObjectPropertyRange       : TypeGuard<IObjectPropertyRange       >;
    IDataPropertyDomain        : TypeGuard<IDataPropertyDomain        >;
    IDataPropertyRange         : TypeGuard<IDataPropertyRange         >;
    IFunctionalObjectProperty  : TypeGuard<IFunctionalObjectProperty  >;
    IFunctionalDataProperty    : TypeGuard<IFunctionalDataProperty    >;
    IAnnotationAssertion       : TypeGuard<IAnnotationAssertion       >;
}
