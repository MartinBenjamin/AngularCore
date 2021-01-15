export type PathSegment = [string, object];
export type Path = PathSegment[];

type Traversal = [State, Path];
export type Transition = [string, State];

export interface State
{
    EpsilonTransitions?: State[];
    Transitions       ?: Transition[];
}

export class Nfa
{
    Initial: State;
    Final = <State>{};

    constructor(
        initial: State
        )
    {
        this.Initial = initial ? initial : <State>{};
    }
}

export interface IExpression
{
    Select<TResult>(selector: ISelector<TResult>): TResult;
    Nfa(initialState?: State): Nfa;
}

export interface IComposite<TExpression>
{
    Expressions: TExpression[];
}

export interface IAlternative<TExpression> extends IComposite<TExpression>
{ }


export interface ISequence<TExpression> extends IComposite<TExpression>
{ }

export interface IQuantifier<TQuantified>
{
    Quantified: TQuantified;
}

export interface IZeroOrOne<TQuantified> extends IQuantifier<TQuantified>
{ }

export interface IZeroOrMore<TQuantified> extends IQuantifier<TQuantified>
{ }

export interface IOneOrMore<TQuantified> extends IQuantifier<TQuantified>
{ }

export interface ISelector<TResult>
{
    Empty      (): TResult;
    Property   (property: Property): TResult;
    Alternative(): TResult & IAlternative<TResult>;
    Sequence   (): TResult & ISequence<TResult>;
    ZeroOrOne  (): TResult & IZeroOrOne<TResult>;
    ZeroOrMore (): TResult & IZeroOrMore<TResult>;
    OneOrMore  (): TResult & IOneOrMore<TResult>;
}

export const Empty = <IExpression>
{
    Select: function<TResult>(
        selector: ISelector<TResult>
        ): TResult
    {
        return selector.Empty();
    },

    Nfa: (
        initialState: State
        ): Nfa =>
    {
        let nfa = new Nfa(initialState);
        nfa.Initial.EpsilonTransitions = [nfa.Final];
        return nfa;
    }
}

export class Property implements IExpression
{
    constructor(
        public Name: string
        )
    {
    }

    Select<TResult>(
        selector: ISelector<TResult>
        ): TResult
    {
        return selector.Property(this);
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = new Nfa(initialState);
        nfa.Initial.Transitions = [[this.Name, nfa.Final]];
        return nfa;
    }
}

export const Any = new Property('.');

export class Alternative implements IExpression
{
    constructor(
        public Expressions: IExpression[]
        )
    {
    }

    Select<TResult>(
        selector: ISelector<TResult>
        ): TResult
    {
        let alternative = selector.Alternative();
        alternative.Expressions = this.Expressions.map(expression => expression.Select(selector));
        return alternative;
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = new Nfa(initialState);
        let innerNfas = this.Expressions.map(expression => expression.Nfa());
        nfa.Initial.EpsilonTransitions = innerNfas.map(innerNfa => innerNfa.Initial);
        innerNfas.forEach(innerNfa => innerNfa.Final.EpsilonTransitions = [nfa.Final]);
        return nfa;
    }
}

export class Sequence implements IExpression
{
    constructor(
        public Expressions: IExpression[]
        )
    {
    }

    Select<TResult>(
        selector: ISelector<TResult>
        ): TResult
    {
        let sequence = selector.Sequence();
        sequence.Expressions = this.Expressions.map(expression => expression.Select(selector));
        return sequence;
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        return this.Expressions.reduce(
            (accumulator: Nfa, currentValue: IExpression) =>
            {
                if(accumulator === null)
                    return currentValue.Nfa(initialState);

                accumulator.Final = currentValue.Nfa(accumulator.Final).Final;
                return accumulator;
            },
            null);
    }
}

export class ZeroOrOne implements IExpression
{
    constructor(
        public Expression: IExpression
        )
    {
    }

    Select<TResult>(
        selector: ISelector<TResult>
        ): TResult
    {
        let zeroOrOne = selector.ZeroOrOne();
        zeroOrOne.Quantified = this.Expression.Select(selector);
        return zeroOrOne;
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = new Nfa(initialState);
        let innerNfa = this.Expression.Nfa();
        nfa.Initial.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
        innerNfa.Final.EpsilonTransitions = [nfa.Final];
        return nfa;
    }
}

export class ZeroOrMore implements IExpression
{
    constructor(
        public Expression: IExpression
        )
    {
    }

    Select<TResult>(
        selector: ISelector<TResult>
        ): TResult
    {
        let zeroOrMore = selector.ZeroOrMore();
        zeroOrMore.Quantified = this.Expression.Select(selector);
        return zeroOrMore;
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = new Nfa(initialState);
        let innerNfa = this.Expression.Nfa();
        nfa.Initial.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
        innerNfa.Final.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
        return nfa;
    }
}

export class OneOrMore implements IExpression
{
    constructor(
        public Expression: IExpression
        )
    {
    }

    Select<TResult>(
        selector: ISelector<TResult>
        ): TResult
    {
        let oneOrMore = selector.OneOrMore();
        oneOrMore.Quantified = this.Expression.Select(selector);
        return oneOrMore;
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = new Nfa(initialState);
        let innerNfa = this.Expression.Nfa();
        nfa.Initial.EpsilonTransitions = [innerNfa.Initial];
        innerNfa.Final.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
        return nfa;
    }
}

interface INfaFactory
{
    Build(initialState?: State): Nfa;
}

class NfaFactorySelector implements ISelector<INfaFactory>
{
    Empty(): INfaFactory
    {
        return {

            Build(
                initialState?: State
                ): Nfa
            {
                let nfa = new Nfa(initialState);
                nfa.Initial.EpsilonTransitions = [nfa.Final];
                return nfa;
            }
        };
    }

    Property(
        property: Property
        ): INfaFactory
    {
        return {

            Build(
                initialState?: State
                ): Nfa
            {
                let nfa = new Nfa(initialState);
                nfa.Initial.Transitions = [[property.Name, nfa.Final]];
                return nfa;
            }
        };
    }

    Alternative(): INfaFactory & IAlternative<INfaFactory>
    {
        return {
            Expressions: null,
            Build(
                this         : INfaFactory & IAlternative<INfaFactory>,
                initialState?: State
                ): Nfa
            {
                let nfa = new Nfa(initialState);
                let innerNfas = this.Expressions.map(expression => expression.Build());
                nfa.Initial.EpsilonTransitions = innerNfas.map(innerNfa => innerNfa.Initial);
                innerNfas.forEach(innerNfa => innerNfa.Final.EpsilonTransitions = [nfa.Final]);
                return nfa;
            }
        };
    }

    Sequence(): INfaFactory & ISequence<INfaFactory>
    {
        return {
            Expressions: null,
            Build(
                this         : INfaFactory & ISequence<INfaFactory>,
                initialState?: State
                ): Nfa
            {
                return this.Expressions.reduce(
                    (accumulator: Nfa, currentValue: INfaFactory) =>
                    {
                        if(!accumulator)
                            return currentValue.Build(initialState);

                        accumulator.Final = currentValue.Build(accumulator.Final).Final;
                        return accumulator;
                    },
                    null);
            }
        };
    }

    ZeroOrOne(): INfaFactory & IZeroOrOne<INfaFactory>
    {
        return {
            Quantified: null,
            Build(
                this         : INfaFactory & IZeroOrOne<INfaFactory>,
                initialState?: State
                ): Nfa
            {
                let nfa = new Nfa(initialState);
                let innerNfa = this.Quantified.Build();
                nfa.Initial.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
                innerNfa.Final.EpsilonTransitions = [nfa.Final];
                return nfa;
            }
        };
    }

    ZeroOrMore(): INfaFactory & IZeroOrMore<INfaFactory>
    {
        return {
            Quantified: null,
            Build(
                this         : INfaFactory & IZeroOrMore<INfaFactory>,
                initialState?: State
                ): Nfa
            {
                let nfa = new Nfa(initialState);
                let innerNfa = this.Quantified.Build();
                nfa.Initial.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
                innerNfa.Final.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
                return nfa;
            }
        };
    }

    OneOrMore(): INfaFactory & IOneOrMore<INfaFactory>
    {
        return {
            Quantified: null,
            Build(
                this         : INfaFactory & IOneOrMore<INfaFactory>,
                initialState?: State
                ): Nfa
            {
                let nfa = new Nfa(initialState);
                let innerNfa = this.Quantified.Build();
                nfa.Initial.EpsilonTransitions = [innerNfa.Initial];
                innerNfa.Final.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
                return nfa;
            }
        };
    }
}

export function Query(
    object    : object,
    expression: IExpression
    ): Set<any>
{
    let result = new Set<any>();
    //let nfa = expression.Nfa();
    let nfa = expression.Select(new NfaFactorySelector()).Build();
    let traversals: [State, object][] = [[nfa.Initial, object]];

    while(traversals.length)
    {
        let [state, object] = traversals.shift();

        if(state === nfa.Final)
            result.add(object);

        else if(state.EpsilonTransitions)
            state.EpsilonTransitions.forEach(state => traversals.push([state, object]));

        else if(typeof object === 'object' && object !== null)
            for(let [property, nextState] of state.Transitions)
                if(property === '.')
                    for(let key in object)
                    {
                        let value = object[key];
                        if(value instanceof Array)
                            value.forEach(element => traversals.push([nextState, element]));

                        else
                            traversals.push([nextState, value]);
                    }
                else if(property in object)
                {
                    let value = object[property];
                    if(value instanceof Array)
                        value.forEach(element => traversals.push([nextState, element]));

                    else
                        traversals.push([nextState, value]);
                }
    }

    return result;
}

export function QueryPaths(
    object    : object,
    expression: IExpression
    ): Path[]
{
    let paths: Path[] = [];
    let nfa = expression.Nfa();
    let traversals: Traversal[] = [[nfa.Initial, [[null, object]]]];

    while(traversals.length)
    {
        let [state, path] = traversals.shift();
        let [,object] = path[path.length - 1];

        if(state === nfa.Final)
            paths.push(path);

        if(state.EpsilonTransitions)
            state.EpsilonTransitions.forEach(state => traversals.push([state, [...path]]));

        else if(typeof object === 'object' && object !== null)
            for(let [property, nextState] of state.Transitions)
                if(property === '.')
                    for(let key in object)
                    {
                        let value = object[property];
                        if(value instanceof Array)
                            value.forEach(element => traversals.push([nextState, [...path, [key, element]]]));

                        else
                            traversals.push([nextState, [...path, [key, value]]]);
                    }
                else if(property in object)
                {
                    let value = object[property];
                    if(value instanceof Array)
                        value.forEach(element => traversals.push([nextState, [...path, [property, element]]]));

                    else
                        traversals.push([nextState, [...path, [property, value]]]);
                }
    }

    return paths;
}
