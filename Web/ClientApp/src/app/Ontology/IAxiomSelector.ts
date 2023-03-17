import { Observable } from "rxjs";
import { Deals } from "../Ontologies/Deals";
import { IDLSafeRule } from "./DLSafeRule";
import { IAxiom } from "./IAxiom";
import { IClass, IClassSelector } from './IClass';
import { IDataPropertyRange } from "./IDataPropertyRange";
import { IDatatypeSelector } from "./IDatatype";
import { IIndividual } from './IIndividual';
import { IPropertySelector } from "./IProperty";
import { IPropertyExpression } from './IPropertyExpression';
import { ISubClassOf } from "./ISubClassOf";

export interface IAxiomSelector<TResult> extends
    IClassSelector<TResult>,
    IPropertySelector<TResult>,
    IDatatypeSelector<TResult>
{
    Axiom            (axiom            : IAxiom            ): TResult;
    DataPropertyRange(dataPropertyRange: IDataPropertyRange): TResult;
    SubclassOf       (subClassOf       : ISubClassOf       ): TResult;
    DLSafeRule       (dlSafeRule       : IDLSafeRule       ): TResult;
}

type MappedOntology<Type> = {
    [Property in keyof Type]:
    Type[Property] extends IClass ? () => Observable<Set<any>> :
    Type[Property] extends IPropertyExpression ? () => Observable<[any, any][]> :
    Type[Property] extends IIndividual ? () => any :
    Type[Property];
};

type X = MappedOntology<Deals>;
let x: X;
x.Bank;
x.BorrowerParty;
x.Equity;



