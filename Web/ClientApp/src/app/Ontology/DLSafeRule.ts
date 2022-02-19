import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DealStageIdentifier } from '../Deals';
import { annotations } from '../Ontologies/Annotations';
import { fees } from '../Ontologies/Fees';
import { BuiltIn, Equal, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, NotEqual } from './Atom';
import { Axiom } from './Axiom';
import { IsVariable } from './EavStore';
import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataRange } from "./IDataRange";
import { IIndividual } from "./IIndividual";
import { IOntology } from './IOntology';
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { IEavStore } from './ObservableGenerator';

// http://www.cs.ox.ac.uk/files/2445/rulesyntaxTR.pdf
/*
axioms        ::= { Axiom | Rule | DGAxiom }
Rule          ::= DLSafeRule | DGRule
DLSafeRule    ::= DLSafeRule ‘(’ {Annotation} ‘Body’ ‘(’ {Atom} ‘)’
                  ‘Head’ ‘(’ {Atom} ‘)’ ‘)’
Atom          ::= ‘ClassAtom’ ‘(’ ClassExpression IArg ‘)’
                  | ‘DataRangeAtom’ ‘(’ DataRange DArg ‘)’
                  | ‘ObjectPropertyAtom’ ‘(’ ObjectPropertyExpression IArg IArg ‘)’
                  | ‘DataPropertyAtom’ ‘(’ DataProperty IArg DArg ‘)’
                  | ‘BuiltInAtom’ ‘(’ IRI DArg {DArg} ‘)’
                  | ‘SameIndividualAtom’ ‘(’ IArg IArg ‘)’
                  | ‘DifferentIndividualsAtom’ ‘(’ IArg IArg‘)’
IArg          ::= IndividualID
                  | ‘IndividualVariable’ ‘(’ IRI ‘)’
DArg          ::= Literal
                  | ‘LiteralVariable’ ‘(’ IRI ‘)’
DGRule        ::= DescriptionGraphRule ‘(’ {Annotation} ‘Body’ ‘(’ {DGAtom} ‘)’
                  ‘Head’ ‘(’ {DGAtom} ‘)’ ‘)’
DGAtom        ::= ‘ClassAtom’ ‘(’ ClassExpression IArg ‘)’
                  | ‘ObjectPropertyAtom’ ‘(’ ObjectPropertyExpression IArg IArg ‘)’
DGAxiom       ::= ‘DescriptionGraph’ ‘(’ {Annotation} DGName DGNodes
                  DGEdges MainClasses‘)’
DGName        ::= IRI
DGNodes       ::= ‘Nodes’‘(’ NodeAssertion {NodeAssertion } ‘)’
NodeAssertion ::= ‘NodeAssertion’‘(’ Class DGNode ‘)’
DGNode        ::= IRI
DGEdges       ::= ‘Edges’‘(’ EdgeAssertion {EdgeAssertion } ‘)’
EdgeAssertion ::= ‘EdgeAssertion’ ‘(’ ObjectProperty DGNode DGNode‘)’
MainClasses   ::= ‘MainClasses’ ‘(’ Class {Class } ‘)’

*/

export type IndividualVariable = string;
export type IArg = IIndividual | IndividualVariable;
export type LiteralVariable = string;
export type DArg = any | LiteralVariable;
export type Arg = IArg | DArg;

export interface IAtom
{
    Select<TResult>(selector: IAtomSelector<TResult>): TResult
}

export interface IDLSafeRule extends IAxiom
{
    readonly Head: IAtom[],
    readonly Body: IAtom[]
}

export interface IClassAtom extends IAtom
{
    readonly ClassExpression: IClassExpression;
    readonly Individual     : IArg;
}

export interface IDataRangeAtom extends IAtom
{
    readonly DataRange: IDataRange;
    readonly Value    : DArg;
}

export interface IObjectPropertyAtom extends IAtom
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
    readonly Domain                  : IArg;
    readonly Range                   : IArg;
}

export interface IDataPropertyAtom extends IAtom
{
    readonly DataPropertyExpression: IDataPropertyExpression;
    readonly Domain                : IArg;
    readonly Range                 : DArg;
}

export interface IComparisonAtom extends IAtom
{
    readonly Lhs: Arg;
    readonly Rhs: Arg;
}

export interface ILessThanAtom           extends IComparisonAtom {};
export interface ILessThanOrEqualAtom    extends IComparisonAtom {};
export interface IEqualAtom              extends IComparisonAtom {};
export interface INotEqualAtom           extends IComparisonAtom {};
export interface IGreaterThanOrEqualAtom extends IComparisonAtom {};
export interface IGreaterThanAtom        extends IComparisonAtom {};

export interface IAtomSelector<TResult>
{
    Class             (class$            : IClassAtom             ): TResult;
    DataRange         (dataRange         : IDataRangeAtom         ): TResult;
    ObjectProperty    (objectProperty    : IObjectPropertyAtom    ): TResult;
    DataProperty      (dataProperty      : IDataPropertyAtom      ): TResult;
    LessThan          (lessThan          : ILessThanAtom          ): TResult;
    LessThanOrEqual   (lessThanOrEqual   : ILessThanOrEqualAtom   ): TResult;
    Equal             (equal             : IEqualAtom             ): TResult;
    NotEqual          (notEqual          : INotEqualAtom          ): TResult;
    GreaterThanOrEqual(greaterThanOrEqual: IGreaterThanOrEqualAtom): TResult;
    GreaterThan       (greaterThan       : IGreaterThanAtom       ): TResult;
}

export interface IDLSafeRuleBuilder
{
    IndividualVariable(name: string): IndividualVariable;
    LiteralVariable(name: string): LiteralVariable;
    ClassAtom(ce: IClassExpression, individual: IArg): IClassAtom;
    DataRangeAtom(dr: IDataRange, value: DArg): IDataRangeAtom;
    ObjectPropertyAtom(ope: IObjectPropertyExpression, domain: IArg, range: IArg): IObjectPropertyAtom;
    DataPropertyAtom(dpe: IDataPropertyExpression, domain: IArg, range: DArg): IDataPropertyAtom;

    LessThan          (lhs: Arg, rhs: Arg): ILessThanAtom          ;
    LessThanOrEqual   (lhs: Arg, rhs: Arg): ILessThanOrEqualAtom   ;
    Equal             (lhs: Arg, rhs: Arg): IEqualAtom             ;
    NotEqual          (lhs: Arg, rhs: Arg): INotEqualAtom          ;
    GreaterThanOrEqual(lhs: Arg, rhs: Arg): IGreaterThanOrEqualAtom;
    GreaterThan       (lhs: Arg, rhs: Arg): IGreaterThanAtom       ;

    Rule(
        head: IAtom[],
        body: IAtom[]): IDLSafeRule;
}

export class DLSafeRuleBuilder implements IDLSafeRuleBuilder
{
    constructor(
        private _ontology: IOntology
        )
    {
    }

    IndividualVariable(
        name: string
        ): string
    {
        return name;
    }

    LiteralVariable(
        name: string
        ): string
    {
        return name;
    }

    ClassAtom(
        ce        : IClassExpression,
        individual: IArg
        ): IClassAtom
    {
        return new ClassAtom(
            ce,
            individual);
    }

    DataRangeAtom(
        dr   : IDataRange,
        value: DArg
        ): IDataRangeAtom
    {
        return new DataRangeAtom(
            dr,
            value);
    }

    ObjectPropertyAtom(
        ope   : IObjectPropertyExpression,
        domain: IArg,
        range : IArg
        ): IObjectPropertyAtom
    {
        throw new ObjectPropertyAtom(
            ope,
            domain,
            range);
    }

    DataPropertyAtom(
        dpe   : IDataPropertyExpression,
        domain: IArg,
        range : any
        ): IDataPropertyAtom
    {
        return new DataPropertyAtom(
            dpe,
            domain,
            range);
    }

    LessThan(
        lhs: any,
        rhs: any
        ): ILessThanAtom
    {
        const lessThan = {
            Lhs: lhs,
            Rhs: rhs,
            Select: <TResult>(selector: IAtomSelector<TResult>): TResult => selector.LessThan(lessThan)
        };
        return lessThan;
    }

    LessThanOrEqual(
        lhs: any,
        rhs: any
        ): ILessThanOrEqualAtom
    {
        const lessThanOrEqual = {
            Lhs: lhs,
            Rhs: rhs,
            Select: <TResult>(selector: IAtomSelector<TResult>): TResult => selector.LessThanOrEqual(lessThanOrEqual)
        };
        return lessThanOrEqual;
    }

    Equal(
        lhs: any,
        rhs: any
        ): IEqualAtom
    {
        const equal = {
            Lhs: lhs,
            Rhs: rhs,
            Select: <TResult>(selector: IAtomSelector<TResult>): TResult => selector.Equal(equal)
        };
        return equal;
    }

    NotEqual(
        lhs: any,
        rhs: any
        ): INotEqualAtom
    {
        const notEqual = {
            Lhs: lhs,
            Rhs: rhs,
            Select: <TResult>(selector: IAtomSelector<TResult>): TResult => selector.NotEqual(notEqual)
        };
        return notEqual;
    }

    GreaterThanOrEqual(
        lhs: any,
        rhs: any
        ): IGreaterThanOrEqualAtom
    {
        const greaterThanOrEqual = {
            Lhs: lhs,
            Rhs: rhs,
            Select: <TResult>(selector: IAtomSelector<TResult>): TResult => selector.GreaterThanOrEqual(greaterThanOrEqual)
        };
        return greaterThanOrEqual;
    }

    GreaterThan(
        lhs: any,
        rhs: any
        ): IGreaterThanAtom
    {
        const greaterThan = {
            Lhs: lhs,
            Rhs: rhs,
            Select: <TResult>(selector: IAtomSelector<TResult>): TResult => selector.GreaterThan(greaterThan)
        };
        return greaterThan;
    }

    Rule(
        head: IAtom[],
        body: IAtom[]
        ): IDLSafeRule
    {
        return new DLSafeRule(
            this._ontology,
            head,
            body);
    }
}

export class ClassAtom implements IClassAtom
{
    constructor(
        public readonly ClassExpression: IClassExpression,
        public readonly Individual     : IArg       
        )
    {
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        return selector.Class(this);
    }
}

export class DataRangeAtom implements IDataRangeAtom
{
    constructor(
        public readonly DataRange: IDataRange,
        public readonly Value    : DArg
        )
    {
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        return selector.DataRange(this);
    }
}

export class ObjectPropertyAtom implements IObjectPropertyAtom
{
    constructor(
        public readonly ObjectPropertyExpression: IObjectPropertyExpression,
        public readonly Domain                  : IArg,
        public readonly Range                   : IArg
        )
    {
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        return selector.ObjectProperty(this);
    }
}

export class DataPropertyAtom implements IDataPropertyAtom
{
    constructor(
        public readonly DataPropertyExpression: IDataPropertyExpression,
        public readonly Domain                : IArg,
        public readonly Range                 : DArg
        )
    {
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        return selector.DataProperty(this);
    }
}

export class DLSafeRule extends Axiom
{
    constructor(
        ontology            : IOntology,
        public readonly Head: IAtom[],
        public readonly Body: IAtom[]
        )
    {
        super(ontology);
    }
}

export class Generator implements IAtomSelector<Observable<Set<any> | [any, any][]> | BuiltIn>
{
    private static readonly _empty = new Set<any>();

    constructor(
        private _store                   : IEavStore,
        private _classObservableGenerator: IClassExpressionSelector<Observable<Set<any>>>
        )
    {

    }

    Class(
        class$: IClassAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        const observable = class$.ClassExpression.Select(this._classObservableGenerator);
        const individual = new Set([class$.Individual]);

        return IsVariable(class$.Individual) ?
            observable : observable.pipe(map(individuals => individuals.has(class$.Individual) ? individual : Generator._empty));
    }

    DataRange(
        dataRange: IDataRangeAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        return function*(
            subsititions: Iterable<object>
            ): Iterator<object>
        {
            for(const substitution of subsititions)
                if(dataRange.DataRange.HasMember(IsVariable(dataRange.Value) ? substitution[dataRange.Value] : dataRange.Value))
                    yield substitution;
        };
    }

    ObjectProperty(
        objectProperty: IObjectPropertyAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        return this._store.ObserveAtom([objectProperty.Domain, objectProperty.ObjectPropertyExpression.LocalName, objectProperty.Range])
            .pipe(map(facts => facts.map(([entity, , value]) => [entity, value])));
    }

    DataProperty(
        dataProperty: IDataPropertyAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        return this._store.ObserveAtom([dataProperty.Domain, dataProperty.DataPropertyExpression.LocalName, dataProperty.Range])
            .pipe(map(facts => facts.map(([entity, , value]) => [entity, value])));
    }

    LessThan(
        lessThan: ILessThanAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        return LessThan(lessThan.Lhs, lessThan.Rhs);
    }

    LessThanOrEqual(
        lessThanOrEqual: ILessThanOrEqualAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        return LessThanOrEqual(lessThanOrEqual.Lhs, lessThanOrEqual.Rhs);
    }

    Equal(
        equal: IEqualAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        return Equal(equal.Lhs, equal.Rhs);
    }

    NotEqual(
        notEqual: INotEqualAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        return NotEqual(notEqual.Lhs, notEqual.Rhs);
    }

    GreaterThanOrEqual(
        greaterThanOrEqual: IGreaterThanOrEqualAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        GreaterThanOrEqual(greaterThanOrEqual.Lhs, greaterThanOrEqual.Rhs);
    }

    GreaterThan(
        greaterThan: IGreaterThanAtom
        ): BuiltIn | Observable<Set<any> | [any, any][]>
    {
        return GreaterThan(greaterThan.Lhs, greaterThan.Rhs);
    }
}

let builder: IDLSafeRuleBuilder;

builder.Rule(
    [
        builder.ObjectPropertyAtom(fees.HasAccrualDate, '?fee', '?AccrualDate'),
        builder.DataPropertyAtom(fees.ExpectedReceivedDate, '?fee', '?expectedReceivedDate'),
        builder.LessThan('?accrualDate', '?expectedReceivedDate')
    ],
    [
        builder.ObjectPropertyAtom(fees.HasAccrualDate, '?fee', '?AccrualDate'),
        builder.DataPropertyAtom(fees.ExpectedReceivedDate, '?fee', '?expectedReceivedDate')
    ]).Annotate(
        annotations.RestrictedfromStage,
        DealStageIdentifier.Prospect);


function ObserveAtoms(
    atoms: any[]
    )
{


}

function Generate(
    store                   : IEavStore,
    observableClassGenerator: IClassExpressionSelector<Observable<Set<any>>>,
    rule                    : IDLSafeRule
    ): Observable<Set<any>>
{
    const generator = new Generator(
        store,
        observableClassGenerator);

    const head = rule.Head.map(atom => atom.Select(generator));
    const body = rule.Head.map(atom => atom.Select(generator));
    return null;

}
