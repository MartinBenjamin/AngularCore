import { IAnnotated } from "./IAnnotated";
import { IAxiomSelector } from "./IAxiomSelector";
import { IAxiomVisitor } from "./IAxiomVisitor";
import { IOntology } from "./IOntology";

export interface IAxiom extends IAnnotated
{
    readonly Ontology: IOntology;

    Accept(visitor: IAxiomVisitor): void;
    Select<TResult>(selector: IAxiomSelector<TResult>): TResult;
}
