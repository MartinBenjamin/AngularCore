import { Variable } from '../EavStore/Datalog';
import { Axiom } from './Axiom';
import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IDataRange } from "./IDataRange";
import { IIndividual } from "./IIndividual";
import { IOntology } from './IOntology';
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";

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

export type IArg = IIndividual | Variable;
export type DArg = any | Variable;
export type Arg = IArg | DArg;

export interface IAtom
{
    [Symbol.iterator](): IterableIterator<Arg>;

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
    readonly Lhs: DArg;
    readonly Rhs: DArg;
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
    ClassAtom         (ce: IClassExpression, individual: IArg): IClassAtom;
    DataRangeAtom     (dr: IDataRange, value: DArg): IDataRangeAtom;
    ObjectPropertyAtom(ope: IObjectPropertyExpression, domain: IArg, range: IArg): IObjectPropertyAtom;
    DataPropertyAtom  (dpe: IDataPropertyExpression  , domain: IArg, range: DArg): IDataPropertyAtom;

    LessThan          (lhs: DArg, rhs: DArg): ILessThanAtom          ;
    LessThanOrEqual   (lhs: DArg, rhs: DArg): ILessThanOrEqualAtom   ;
    Equal             (lhs: DArg, rhs: DArg): IEqualAtom             ;
    NotEqual          (lhs: DArg, rhs: DArg): INotEqualAtom          ;
    GreaterThanOrEqual(lhs: DArg, rhs: DArg): IGreaterThanOrEqualAtom;
    GreaterThan       (lhs: DArg, rhs: DArg): IGreaterThanAtom       ;

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
        lhs: DArg,
        rhs: DArg
        ): ILessThanAtom
    {
        return new LessThanAtom(lhs, rhs);
    }

    LessThanOrEqual(
        lhs: DArg,
        rhs: DArg
        ): ILessThanOrEqualAtom
    {
        return new LessThanOrEqualAtom(lhs, rhs);
    }

    Equal(
        lhs: DArg,
        rhs: DArg
        ): IEqualAtom
    {
        return new EqualAtom(lhs, rhs);
    }

    NotEqual(
        lhs: DArg,
        rhs: DArg
        ): INotEqualAtom
    {
        return new NotEqualAtom(lhs, rhs);
    }

    GreaterThanOrEqual(
        lhs: DArg,
        rhs: DArg
        ): IGreaterThanOrEqualAtom
    {
        return new GreaterThanOrEqualAtom(lhs, rhs);
    }

    GreaterThan(
        lhs: DArg,
        rhs: DArg
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

    *[Symbol.iterator](): IterableIterator<any>
    {
        yield this.Individual;
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

    *[Symbol.iterator](): IterableIterator<any>
    {
        yield this.Value;
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

    *[Symbol.iterator](): IterableIterator<any>
    {
        yield this.Domain;
        yield this.Range;
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
        public Lhs: DArg,
        public Rhs: DArg,
        )
    {
    }

    *[Symbol.iterator](): IterableIterator<any>
    {
        yield this.Lhs;
        yield this.Rhs;
    }

    Select<TResult>(
        selector: IAtomSelector<TResult>
        ): TResult
    {
        throw new Error("Method not implemented.");
    }
}

export class LessThanAtom           extends ComparisonAtom implements ILessThanAtom           { constructor(lhs: DArg, rhs: DArg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.LessThan          (this);}};
export class LessThanOrEqualAtom    extends ComparisonAtom implements ILessThanOrEqualAtom    { constructor(lhs: DArg, rhs: DArg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.LessThanOrEqual   (this);}};
export class EqualAtom              extends ComparisonAtom implements IEqualAtom              { constructor(lhs: DArg, rhs: DArg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.Equal             (this);}};
export class NotEqualAtom           extends ComparisonAtom implements INotEqualAtom           { constructor(lhs: DArg, rhs: DArg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.NotEqual          (this);}};
export class GreaterThanOrEqualAtom extends ComparisonAtom implements IGreaterThanOrEqualAtom { constructor(lhs: DArg, rhs: DArg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.GreaterThanOrEqual(this);}};
export class GreaterThanAtom        extends ComparisonAtom implements IGreaterThanAtom        { constructor(lhs: DArg, rhs: DArg) { super(lhs, rhs); } Select<TResult>(selector: IAtomSelector<TResult>): TResult { return selector.GreaterThan       (this);}};

type TypeGuard<T extends object> = (o: object) => o is T;

export interface IIsAtom
{
    IClassAtom             : TypeGuard<IClassAtom             >;
    IDataRangeAtom         : TypeGuard<IDataRangeAtom         >;
    IPropertyAtom          : TypeGuard<IPropertyAtom          >;
    IObjectPropertyAtom    : TypeGuard<IObjectPropertyAtom    >;
    IDataPropertyAtom      : TypeGuard<IDataPropertyAtom      >;
    IComparisonAtom        : TypeGuard<IComparisonAtom        >;
    ILessThanAtom          : TypeGuard<ILessThanAtom          >;
    ILessThanOrEqualAtom   : TypeGuard<ILessThanOrEqualAtom   >;
    IEqualAtom             : TypeGuard<IEqualAtom             >;
    INotEqualAtom          : TypeGuard<INotEqualAtom          >;
    IGreaterThanOrEqualAtom: TypeGuard<IGreaterThanOrEqualAtom>;
    IGreaterThanAtom       : TypeGuard<IGreaterThanAtom       >;
}

export class IsAtom implements IIsAtom
{
    IClassAtom             (a: object): a is IClassAtom              { return a instanceof ClassAtom             ; };
    IDataRangeAtom         (a: object): a is IDataRangeAtom          { return a instanceof DataRangeAtom         ; };
    IPropertyAtom          (a: object): a is IPropertyAtom           { return a instanceof PropertyAtom          ; };
    IObjectPropertyAtom    (a: object): a is IObjectPropertyAtom     { return a instanceof ObjectPropertyAtom    ; };
    IDataPropertyAtom      (a: object): a is IDataPropertyAtom       { return a instanceof DataPropertyAtom      ; };
    IComparisonAtom        (a: object): a is IComparisonAtom         { return a instanceof ComparisonAtom        ; };
    ILessThanAtom          (a: object): a is ILessThanAtom           { return a instanceof LessThanAtom          ; };
    ILessThanOrEqualAtom   (a: object): a is ILessThanOrEqualAtom    { return a instanceof LessThanOrEqualAtom   ; };
    IEqualAtom             (a: object): a is IEqualAtom              { return a instanceof EqualAtom             ; };
    INotEqualAtom          (a: object): a is INotEqualAtom           { return a instanceof NotEqualAtom          ; };
    IGreaterThanOrEqualAtom(a: object): a is IGreaterThanOrEqualAtom { return a instanceof GreaterThanOrEqualAtom; };
    IGreaterThanAtom       (a: object): a is IGreaterThanAtom        { return a instanceof GreaterThanAtom       ; };
}

export class DLSafeRule extends Axiom implements IDLSafeRule
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

export function IsDLSafeRule(
    axiom: any
    ): axiom is IDLSafeRule
{
    return axiom instanceof DLSafeRule;
}
