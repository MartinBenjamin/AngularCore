import { BuiltIn, Equal, GreaterThan, GreaterThanOrEqual, LessThan, LessThanOrEqual, NotEqual } from './Atom';
import { Axiom } from './Axiom';
import { EavStore } from './EavStore';
import { IAxiom } from "./IAxiom";
import { IClassExpression } from "./IClassExpression";
import { IClassExpressionSelector } from './IClassExpressionSelector';
import { IDataRange } from "./IDataRange";
import { IsConstant, IsVariable } from './IEavStore';
import { IIndividual } from "./IIndividual";
import { IOntology } from './IOntology';
import { IProperty } from './IProperty';
import { IDataPropertyExpression, IObjectPropertyExpression, IPropertyExpression } from "./IPropertyExpression";
import { IPropertyExpressionSelector } from './IPropertyExpressionSelector';
import { Wrap, Wrapped, WrapperType } from './Wrapped';

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

export interface ICache<TAtom>
{
    Set(
        atom   : IAtom,
        wrapped: TAtom): void;
    Get(atom: IAtom): TAtom
}

export class AtomInterpreter<T extends WrapperType> implements IAtomSelector<Wrapped<T, object[] | BuiltIn>>
{
    private _propertyDefinitions: Map<IPropertyExpression, IDLSafeRule>;

    constructor(
        protected _wrap                         : Wrap<T>,
        private   _ontology                     : IOntology,
        private   _propertyExpressionInterpreter: IPropertyExpressionSelector<Wrapped<T, [any, any][]>>,
        private   _classExpressionInterpreter   : IClassExpressionSelector<Wrapped<T, Set<any>>>
        )
    {
        this._propertyDefinitions           = new Map(
            [...this._ontology.Get(IsDLSafeRule)]
                .filter(rule => rule.Head.length === 1 && rule.Head[0] instanceof PropertyAtom)
                .map(rule => [(<PropertyAtom>rule.Head[0]).PropertyExpression, rule]));
    }

    Class(
        class$: IClassAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        if(IsVariable(class$.Individual))
            return this._wrap(
                individuals => [...individuals].map(
                    individual =>
                    {
                        return { [<string>class$.Individual]: individual };
                    }),
                class$.ClassExpression.Select(this._classExpressionInterpreter));

        return this._wrap(
            individuals => individuals.has(class$.Individual) ? [{}] : [],
            class$.ClassExpression.Select(this._classExpressionInterpreter));
    }

    DataRange(
        dataRange: IDataRangeAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => (
            substitutions: Iterable<object>
            ) =>
        {
            if(IsConstant(dataRange.Value))
                return dataRange.DataRange.HasMember(dataRange.Value) ? substitutions : [];

            return [...substitutions].filter(substitution => dataRange.DataRange.HasMember(substitution[dataRange.Value]));
        });
    }

    ObjectProperty(
        objectProperty: IObjectPropertyAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataPropertyAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this.Property(dataProperty);
    }

    private Property(
        property: IPropertyAtom
        ): Wrapped<T, object[]>
    {
        const propertyDefinition = this._propertyDefinitions.get(property.PropertyExpression);
        if(propertyDefinition)
            return this._wrap(
                EavStore.Conjunction(
                    [(<IPropertyAtom>propertyDefinition.Head[0]).Domain, (<IPropertyAtom>propertyDefinition.Head[0]).Range],
                    [property.Domain, property.Range]),
                ...propertyDefinition.Body.map(atom => atom.Select(this)));

        return this._wrap(
            EavStore.Substitute([property.Domain, property.Range]),
            property.PropertyExpression.Select(this._propertyExpressionInterpreter));
    }

    LessThan(
        lessThan: ILessThanAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => LessThan(lessThan.Lhs, lessThan.Rhs));
    }

    LessThanOrEqual(
        lessThanOrEqual: ILessThanOrEqualAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => LessThanOrEqual(lessThanOrEqual.Lhs, lessThanOrEqual.Rhs));
    }

    Equal(
        equal: IEqualAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => Equal(equal.Lhs, equal.Rhs));
    }

    NotEqual(
        notEqual: INotEqualAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(()=> NotEqual(notEqual.Lhs, notEqual.Rhs));
    }

    GreaterThanOrEqual(
        greaterThanOrEqual: IGreaterThanOrEqualAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => GreaterThanOrEqual(greaterThanOrEqual.Lhs, greaterThanOrEqual.Rhs));
    }

    GreaterThan(
        greaterThan: IGreaterThanAtom
        ): Wrapped<T, object[] | BuiltIn>
    {
        return this._wrap(() => GreaterThan(greaterThan.Lhs, greaterThan.Rhs));
    }

    Atoms(
        atoms: IAtom[]
        ): Wrapped<T, object[]>
    {
        return this._wrap(
            EavStore.Conjunction(),
            ...atoms.map(atom => atom.Select(this)));
    }
}

export function RuleContradictions<T extends WrapperType>(
    wrap       : Wrap<T>,
    interpreter: AtomInterpreter<T>,
    rule       : IDLSafeRule
    ): Wrapped<T, object[]>
{
    return wrap(
        (head, body) => body.reduce<object[]>(
            (failed, x) =>
            {
                if(!head.some(y =>
                {
                    for(const key in x)
                        if(key in y && x[key] !== y[key])
                            return false;
                    return true;
                }))
                    failed.push(x);

                return failed;
            },
            []),
        interpreter.Atoms(rule.Head),
        interpreter.Atoms(rule.Body));
}

export function* ObserveContradictions<T extends WrapperType>(
    wrap                       : Wrap<T>,
    ontology                   : IOntology,
    observablePropertyGenerator: IPropertyExpressionSelector<Wrapped<T, [any, any][]>>,
    observableClassGenerator   : IClassExpressionSelector<Wrapped<T, Set<any>>>,
    rules                      : Iterable<IDLSafeRule>
    ): Iterable<Wrapped<T, [string, IAxiom, Set<any>]>>
{
    const interpreter = new AtomInterpreter(
        wrap,
        ontology,
        observablePropertyGenerator,
        observableClassGenerator);

    for(const rule of rules)
    {
        const comparison = rule.Head.find<IComparisonAtom>((atom): atom is IComparisonAtom => atom instanceof ComparisonAtom);
        const lhsProperty = rule.Head.find<IPropertyAtom>((atom): atom is IPropertyAtom => atom instanceof PropertyAtom && atom.Range === comparison.Lhs);

        if(comparison && lhsProperty)
        {
            yield wrap(contraditions => [
                (<IProperty>lhsProperty.PropertyExpression).LocalName,
                rule,
                new Set(contraditions.map(o => o[<string>lhsProperty.Domain]))],
                RuleContradictions(
                    wrap,
                    interpreter,
                    rule));
        }
    }
}
