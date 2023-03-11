import { BehaviorSubject, combineLatest, Observable } from "rxjs";
import { IDLSafeRule } from "./DLSafeRule";
import { IAxiom } from "./IAxiom";
import { IDataPropertyRange } from "./IDataPropertyRange";
import { ISubClassOf } from "./ISubClassOf";
import { Deals } from "../Ontologies/Deals";
import { IClass } from './IClass';
import { IPropertyExpression } from './IPropertyExpression';
import { IIndividual } from './IIndividual';
import { IOntology } from './IOntology';

export interface IAxiomSelector<TResult>
{
    Axiom            (axiom            : IAxiom            ): TResult;
    Class            (class$           : IClass            ): TResult;
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



