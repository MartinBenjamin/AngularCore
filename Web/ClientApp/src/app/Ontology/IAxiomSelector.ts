import { IDLSafeRule } from "./DLSafeRule";
import { IClassSelector } from './IClass';
import { IDatatypeSelector } from "./IDatatype";
import { IPropertySelector } from "./IProperty";
import { ISubClassOf } from "./ISubClassOf";
import { IDataPropertyRange } from "./IDataPropertyRange";

export interface IAxiomSelector<TResult> extends
    IClassSelector<TResult>,
    IPropertySelector<TResult>,
    IDatatypeSelector<TResult>
{
    SubclassOf       (subClassOf       : ISubClassOf       ): TResult;
    DataPropertyRange(dataPropertyRange: IDataPropertyRange): TResult;
    DLSafeRule       (dlSafeRule       : IDLSafeRule       ): TResult;
}
