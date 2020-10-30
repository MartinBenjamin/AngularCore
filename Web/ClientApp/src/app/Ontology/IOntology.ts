import { ClassMembershipEvaluator } from "./ClassMembershipEvaluator";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IIsAxiom } from './IIsAxiom';
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";

export interface IOntology
{
    readonly Iri    : string;
    readonly Imports: IOntology[];
    readonly Axioms : IAxiom[];
    readonly IsAxiom: IIsAxiom;
    GetOntologies(): Iterable<IOntology>;
    Get<TAxiom extends IAxiom>(typeGuard: (axiom: object) => axiom is TAxiom): Iterable<TAxiom>;

    Classify(
        individual: object,
        evaluator?: ClassMembershipEvaluator): Map<object, Set<IClass>>;

    // Provided tp assist programatic construction of ontologies.
    DeclareClass(localName: string): IClass;
    DeclareObjectProperty(localName: string): IObjectPropertyExpression;
    DeclareDataProperty(localName: string): IDataPropertyExpression;
    DeclareFunctionalDataProperty(localName: string): IDataPropertyExpression;
}
