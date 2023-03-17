import { IAnnotated } from "./IAnnotated";
import { IAxiomSelector } from "./IAxiomSelector";
import { IOntology } from "./IOntology";

export interface IAxiom extends IAnnotated
{
    readonly Ontology: IOntology;

    Select<TResult>(selector: IAxiomSelector<TResult>): TResult;
}
