import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BuiltIn, Equal, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, NotEqual } from './Atom';
import { Axiom } from './Axiom';
import { IsConstant, IsVariable } from './EavStore';
import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataRange } from "./IDataRange";
import { Fact } from './IEavStore';
import { IIndividual } from "./IIndividual";
import { IOntology } from './IOntology';
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";
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

export interface IPropertyAtom extends IAtom
{
    readonly PropertyExpression: IPropertyExpression;
    readonly Domain            : IArg;
    readonly Range             : Arg;
}

export interface IObjectPropertyAtom extends IPropertyAtom
{
    readonly ObjectPropertyExpression: IObjectPropertyExpression;
    readonly Range                   : IArg;
}

export interface IDataPropertyAtom extends IPropertyAtom
{
    readonly DataPropertyExpression: IDataPropertyExpression;
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
        return new ObjectPropertyAtom(
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
        return new LessThanAtom(lhs, rhs);
    }

    LessThanOrEqual(
        lhs: any,
        rhs: any
        ): ILessThanOrEqualAtom
    {
        return new LessThanOrEqualAtom(lhs, rhs);
    }

    Equal(
        lhs: any,
        rhs: any
        ): IEqualAtom
    {
        return new EqualAtom(lhs, rhs);
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
        return new NotEqualAtom(lhs, rhs);
    }

    GreaterThanOrEqual(
        lhs: any,
        rhs: any
        ): IGreaterThanOrEqualAtom
    {
        return new GreaterThanOrEqualAtom(lhs, rhs);
    }

    GreaterThan(
        lhs: any,
        rhs: any
        ): IGreaterThanAtom
    {
        return new GreaterThanAtom(lhs, rhs);
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

export abstract class PropertyAtom implements IPropertyAtom
{
    constructor(
        public readonly PropertyExpression: IPropertyExpression,
        public readonly Domain            : IArg,
        public readonly Range             : Arg
        )
    {
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        throw new Error("Method not implemented.");
    }
}

export class ObjectPropertyAtom extends PropertyAtom implements IObjectPropertyAtom
{
    constructor(
        public readonly ObjectPropertyExpression: IObjectPropertyExpression,
        domain                                  : IArg,
        public readonly Range                   : IArg
        )
    {
        super(
            ObjectPropertyExpression,
            domain,
            Range);
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        return selector.ObjectProperty(this);
    }
}

export class DataPropertyAtom extends PropertyAtom implements IDataPropertyAtom
{
    constructor(
        public readonly DataPropertyExpression: IDataPropertyExpression,
        domain                                : IArg,
        public readonly Range                 : DArg
        )
    {
        super(
            DataPropertyExpression,
            domain,
            Range);
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        return selector.DataProperty(this);
    }
}

export abstract class ComparisonAtom implements IComparisonAtom
{
    constructor(
        public Lhs: Arg,
        public Rhs: Arg,
        )
    {
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        throw new Error("Method not implemented.");
    }
}

export class LessThanAtom           extends ComparisonAtom implements ILessThanAtom           { constructor(lhs: Arg, rhs: Arg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.LessThan          (this);}};
export class LessThanOrEqualAtom    extends ComparisonAtom implements ILessThanOrEqualAtom    { constructor(lhs: Arg, rhs: Arg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.LessThanOrEqual   (this);}};
export class EqualAtom              extends ComparisonAtom implements IEqualAtom              { constructor(lhs: Arg, rhs: Arg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.Equal             (this);}};
export class NotEqualAtom           extends ComparisonAtom implements INotEqualAtom           { constructor(lhs: Arg, rhs: Arg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.NotEqual          (this);}};
export class GreaterThanOrEqualAtom extends ComparisonAtom implements IGreaterThanOrEqualAtom { constructor(lhs: Arg, rhs: Arg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.GreaterThanOrEqual(this);}};
export class GreaterThanAtom        extends ComparisonAtom implements IGreaterThanAtom        { constructor(lhs: Arg, rhs: Arg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.GreaterThan       (this);}};

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

export class Generator implements IAtomSelector<Observable<object[]>>
{
    private _previous: Observable<object[]>;

    constructor(
        private _store                   : IEavStore,
        private _classObservableGenerator: IClassExpressionSelector<Observable<Set<any>>>
        )
    {
    }

    Class(
        class$: IClassAtom
        ): Observable<object[]>
    {
        if(IsVariable(class$.Individual))
        return combineLatest(
            this._previous,
            class$.ClassExpression.Select(this._classObservableGenerator),
            (substitutions, individuals) => substitutions.reduce<object[]>(
                (substitutions, substitution) =>
                {
                    for(const individual of individuals)
                    {
                        if(typeof substitution[<string>class$.Individual] === 'undefined')
                        {
                            const merged = { ...substitution };
                            merged[<string>class$.Individual] = individual;
                            substitutions.push(merged);
                        }
                        else if(substitution[<string>class$.Individual] === individual)
                            substitutions.push(substitution);
                    }
                    return substitutions;
                },
                []));

        return combineLatest(
            this._previous,
            class$.ClassExpression.Select(this._classObservableGenerator),
            (substitutions, individuals) => individuals.has(class$.Individual) ? substitutions : []);
    }

    DataRange(
        dataRange: IDataRangeAtom
        ): Observable<object[]>
    {
        return this._previous.pipe(
            map(
                previous => previous.filter(
                    previous =>
                    {
                        if(IsConstant(dataRange.Value))
                            return dataRange.DataRange.HasMember(dataRange.Value);

                        return dataRange.DataRange.HasMember(previous[dataRange.Value]);
                    })));
    }

    ObjectProperty(
        objectProperty: IObjectPropertyAtom
        ): Observable<object[]>
    {
        return this.Property([objectProperty.Domain, objectProperty.ObjectPropertyExpression.LocalName, objectProperty.Range]);
    }

    DataProperty(
        dataProperty: IDataPropertyAtom
        ): Observable<object[]>
    {
        return this.Property([dataProperty.Domain, dataProperty.DataPropertyExpression.LocalName, dataProperty.Range]);
    }

    private Property(
        atom: Fact
        ): Observable<object[]>
    {
        const keys = [0, 2];
        return combineLatest(
            this._previous,
            this._store.ObserveAtom(atom),
            (substitutions, facts) => substitutions.reduce<object[]>(
                (substitutions, substitution) =>
                {
                    for(const fact of facts)
                    {
                        let merged = { ...substitution };
                        for(const key of keys)
                        {
                            const term = atom[key];
                            if(IsVariable(term))
                            {
                                if(typeof merged[term] === 'undefined')
                                    merged[term] = fact[key];

                                else if(merged[term] !== fact[key])
                                {
                                    // Fact does not match query pattern.
                                    merged = null;
                                    break;
                                }
                            }
                        }

                        if(merged)
                            substitutions.push(merged);
                    }
                    return substitutions;
                },
                []));
    }

    LessThan(
        lessThan: ILessThanAtom
        ): Observable<object[]>
    {
        return this.Comparison(LessThan(lessThan.Lhs, lessThan.Rhs));
    }

    LessThanOrEqual(
        lessThanOrEqual: ILessThanOrEqualAtom
        ): Observable<object[]>
    {

        return this.Comparison(LessThanOrEqual(lessThanOrEqual.Lhs, lessThanOrEqual.Rhs));
    }

    Equal(
        equal: IEqualAtom
        ): Observable<object[]>
    {
        return this.Comparison(Equal(equal.Lhs, equal.Rhs));
    }

    NotEqual(
        notEqual: INotEqualAtom
        ): Observable<object[]>
    {
        return this.Comparison(NotEqual(notEqual.Lhs, notEqual.Rhs));
    }

    GreaterThanOrEqual(
        greaterThanOrEqual: IGreaterThanOrEqualAtom
        ): Observable<object[]>
    {
        return this.Comparison(GreaterThanOrEqual(greaterThanOrEqual.Lhs, greaterThanOrEqual.Rhs));
    }

    GreaterThan(
        greaterThan: IGreaterThanAtom
        ): Observable<object[]>
    {
        return this.Comparison(GreaterThan(greaterThan.Lhs, greaterThan.Rhs));
    }

    private Comparison(
        builtIn: BuiltIn
        ): Observable<object[]>
    {
        return this._previous.pipe(map(previous => [...builtIn(previous)]));
    }

    Atoms(
        atoms: IAtom[]
        ): Observable<object[]>
    {
        this._previous = new BehaviorSubject<object[]>([{}]).asObservable();
        let next: Observable<object[]>;
        for(const atom of atoms)
        {
            if(next)
                this._previous = next;
            next = atom.Select(this);
        }
        return next;
    }
}

function ObserveRuleContradictions(
    store                   : IEavStore,
    observableClassGenerator: IClassExpressionSelector<Observable<Set<any>>>,
    rule                    : IDLSafeRule
    ): Observable<object[]>
{
    const generator = new Generator(
        store,
        observableClassGenerator);
    return combineLatest(
        generator.Atoms(rule.Head),
        generator.Atoms(rule.Body),
        (head, body) =>
        {
            const failed: object[] = [];

            for(const x of body)
                if(!head.some(y =>
                {
                    for(const key in x)
                        if(x[key] !== y[key])
                            return false;
                    return true;
                }))
                    failed.push(x);

            return failed;
        });
}

export function ObserveComparisonContradiction(
    store                   : IEavStore,
    observableClassGenerator: IClassExpressionSelector<Observable<Set<any>>>,
    rule                    : IDLSafeRule
    ): Observable<[string, IAxiom, Set<any>]>
{
    // Assume rule is a comparison.
    let property = <IPropertyAtom>rule.Head.find(atom => atom instanceof PropertyAtom)

    return ObserveRuleContradictions(
        store,
        observableClassGenerator,
        rule).pipe(map(
            contraditions => [
                property.PropertyExpression.LocalName,
                rule,
                new Set(contraditions.map(o => o[<string>property.Domain]))
            ]));
}
