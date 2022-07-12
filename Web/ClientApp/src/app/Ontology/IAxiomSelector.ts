import { IDLSafeRule } from "./DLSafeRule";
import { IAxiom } from "./IAxiom";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { ISubClassOf } from "./ISubClassOf";

export interface IAxiomSelector<TResult>
{
    Axiom            (axiom            : IAxiom            ): TResult;
    DataPropertyRange(dataPropertyRange: IDataPropertyRange): TResult;
    SubclassOf       (subClassOf       : ISubClassOf       ): TResult;
    DLSafeRule       (dlSafeRule       : IDLSafeRule       ): TResult;
}
