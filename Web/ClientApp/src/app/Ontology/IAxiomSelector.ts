import { IDLSafeRule } from "./DLSafeRule";
import { IClassSelector } from './IClass';
import { IDatatypeSelector } from "./IDatatype";
import { IPropertySelector } from "./IProperty";
import { ISubClassOf } from "./ISubClassOf";

export interface IAxiomSelector<TResult> extends
    IClassSelector<TResult>,
    IPropertySelector<TResult>,
    IDatatypeSelector<TResult>
{
    SubclassOf(subClassOf: ISubClassOf): TResult;
    DLSafeRule(dlSafeRule: IDLSafeRule): TResult;
}
