import { IAnnotationProperty } from "./IAnnotationProperty";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IIsAxiom } from './IIsAxiom';
import { IIsClassExpression } from './IIsClassExpression';
import { INamedIndividual } from "./INamedIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";

export interface IOntology
{
    readonly Iri              : string;
    readonly Imports          : IOntology[];
    readonly Axioms           : IAxiom[];
    readonly IsAxiom          : IIsAxiom;
    readonly IsClassExpression: IIsClassExpression;

    GetOntologies(): Iterable<IOntology>;
    Get<TAxiom extends IAxiom>(typeGuard: (axiom: object) => axiom is TAxiom): Iterable<TAxiom>;
    Classify(individual: object): Map<object, Set<IClass>>;
    Classify(individuals: Set<object>): Map<object, Set<IClass>>;
    SuperClasses(class$: IClass): Set<IClass>;

    // Provided to assist construction of ontologies.
    DeclareClass(localName: string): IClass;
    DeclareObjectProperty(localName: string): IObjectPropertyExpression;
    DeclareDataProperty(localName: string): IDataPropertyExpression;
    DeclareFunctionalDataProperty(localName: string): IDataPropertyExpression;
    DeclareAnnotationProperty(localName: string): IAnnotationProperty;
    DeclareNamedIndividual(localName: string): INamedIndividual;
}
