import { IAnnotationProperty } from "./IAnnotationProperty";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
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
    Get<TAxiom extends IAxiom>(typeGuard: (axiom: object) => axiom is TAxiom): IterableIterator<TAxiom>;
    SuperClasses(class$: IClassExpression): Set<IClassExpression>;

    // Provided to assist construction of ontologies.
    DeclareClass(localName: string): IClass;
    DeclareObjectProperty(localName: string): IObjectPropertyExpression;
    DeclareFunctionalObjectProperty(localName: string): IObjectPropertyExpression;
    DeclareDataProperty(localName: string): IDataPropertyExpression;
    DeclareFunctionalDataProperty(localName: string): IDataPropertyExpression;
    DeclareAnnotationProperty(localName: string): IAnnotationProperty;
    DeclareNamedIndividual(localName: string): INamedIndividual;
}
