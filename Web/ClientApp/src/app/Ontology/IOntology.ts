import { IAxiom } from "./IAxiom";
import { IIsAxiom } from './IIsAxiom'
import { ClassMembershipEvaluator } from "./ClassMembershipEvaluator";
import { IClass } from "./IClass";

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
}
