import { ClassMembershipEvaluator } from "./ClassMembershipEvaluator";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IIsAxiom } from './IIsAxiom';
import { INamedIndividual } from "./INamedIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IIsClassExpression } from './IIsClassExpression';

export interface IOntology
{
    readonly Iri              : string;
    readonly Imports          : IOntology[];
    readonly Axioms           : IAxiom[];
    readonly IsAxiom          : IIsAxiom;
    readonly IsClassExpression: IIsClassExpression;

    GetOntologies(): Iterable<IOntology>;
    Get<TAxiom extends IAxiom>(typeGuard: (axiom: object) => axiom is TAxiom): Iterable<TAxiom>;

    Classify(
        individual: object,
        evaluator?: ClassMembershipEvaluator): Map<object, Set<IClass>>;

    SuperClasses(class$: IClass): Set<IClass>;

    // Provided to assist construction of ontologies.
    DeclareClass(localName: string): IClass;
    DeclareObjectProperty(localName: string): IObjectPropertyExpression;
    DeclareDataProperty(localName: string): IDataPropertyExpression;
    DeclareFunctionalDataProperty(localName: string): IDataPropertyExpression;
    DeclareAnnotationProperty(localName: string): IAnnotationProperty;
    DeclareNamedIndividual(localName: string): INamedIndividual;
}
