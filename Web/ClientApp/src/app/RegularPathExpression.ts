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

export interface Selector<TResult>
{
    Empty      (                      ): TResult;
    Property   (name: string          ): TResult;
    Alternative(expressions: TResult[]): TResult;
    Sequence   (expressions: TResult[]): TResult;
    ZeroOrOne  (expression: TResult   ): TResult;
    ZeroOrMore (expression: TResult   ): TResult;
    OneOrMore  (expression: TResult   ): TResult;
}

export interface IExpression
{
    Select<TResult>(selector: Selector<TResult>): TResult;
    Nfa(initialState?: State): Nfa;
}

export const Empty = <IExpression>
{
    Select: function<TResult>(
        selector: Selector<TResult>
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
        selector: Selector<TResult>
        ): TResult
    {
        return selector.Property(this.Name);
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
        selector: Selector<TResult>
        ): TResult
    {
        return selector.Alternative(this.Expressions.map(expression => expression.Select(selector)));
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
        selector: Selector<TResult>
        ): TResult
    {
        return selector.Sequence(this.Expressions.map(expression => expression.Select(selector)));
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
        selector: Selector<TResult>
        ): TResult
    {
        return selector.ZeroOrOne(this.Expression.Select(selector));
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
        selector: Selector<TResult>
        ): TResult
    {
        return selector.ZeroOrMore(this.Expression.Select(selector));
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
        selector: Selector<TResult>
        ): TResult
    {
        return selector.OneOrMore(this.Expression.Select(selector));
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

class NfaFactorySelector implements Selector<(initialState?: State) => Nfa>
{
    Empty(): (initialState?: State) => Nfa
    {
        return (initialState?: State) =>
        {
            let nfa = new Nfa(initialState);
            nfa.Initial.EpsilonTransitions = [nfa.Final];
            return nfa;
        };
    }

    Property(
        name: string
        ): (initialState?: State) => Nfa
    {
        return (initialState?: State) =>
        {
            let nfa = new Nfa(initialState);
            nfa.Initial.Transitions = [[name, nfa.Final]];
            return nfa;
        };
    }

    Alternative(
        nfaFactories: ((initialState?: State) => Nfa)[]
        ): (initialState?: State) => Nfa
    {
        return (initialState?: State) =>
        {
            let nfa = new Nfa(initialState);
            let innerNfas = nfaFactories.map(nfaFactory => nfaFactory());
            nfa.Initial.EpsilonTransitions = innerNfas.map(innerNfa => innerNfa.Initial);
            innerNfas.forEach(innerNfa => innerNfa.Final.EpsilonTransitions = [nfa.Final]);
            return nfa;
        };
    }

    Sequence(
        nfaFactories: ((initialState?: State) => Nfa)[]
        ): (initialState?: State) => Nfa
    {
        return (initialState?: State) =>
        {
            return nfaFactories.reduce(
                (accumulator: Nfa, currentValue: (initialState: State) => Nfa) =>
                {
                    if(!accumulator)
                        return currentValue(initialState);

                    accumulator.Final = currentValue(accumulator.Final).Final;
                    return accumulator;
                },
                null);
        };
    }

    ZeroOrOne(
        nfaFactory: (initialState?: State) => Nfa
        ): (initialState?: State) => Nfa
    {
        return (initialState?: State) =>
        {
            let nfa = new Nfa(initialState);
            let innerNfa = nfaFactory();
            nfa.Initial.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
            innerNfa.Final.EpsilonTransitions = [nfa.Final];
            return nfa;
        };
    }

    ZeroOrMore(
        nfaFactory: (initialState?: State) => Nfa
        ): (initialState?: State) => Nfa
    {
        return (initialState?: State) =>
        {
            let nfa = new Nfa(initialState);
            let innerNfa = nfaFactory();
            nfa.Initial.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
            innerNfa.Final.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
            return nfa;
        };
    }

    OneOrMore(
        nfaFactory: (initialState?: State) => Nfa
        ): (initialState?: State) => Nfa
    {
        return (initialState?: State) =>
        {
            let nfa = new Nfa(initialState);
            let innerNfa = nfaFactory();
            nfa.Initial.EpsilonTransitions = [innerNfa.Initial];
            innerNfa.Final.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
            return nfa;
        };
    }
}

export function Query(
    object    : object,
    expression: IExpression
    ): Set<any>
{
    //return new Set<any>(Query2(expression)(object));
    let result = new Set<any>();
    //let nfa = expression.Nfa();
    let nfa = expression.Select(new NfaFactorySelector())();
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

                        else if(value)
                            traversals.push([nextState, value]);
                    }
                else if(property in object)
                {
                    let value = object[property];
                    if(value instanceof Array)
                        value.forEach(element => traversals.push([nextState, element]));

                    else if(value)
                        traversals.push([nextState, value]);
                }
    }

    return result;
}

export function Query2(
    expression: IExpression
    ): (object: object) => Generator<any>
{
    let nfa = expression.Select(new NfaFactorySelector())();

    return function*(
        object: object
        ): Generator<any>
    {
        //let nfa = expression.Nfa();
        let traversals: [State, object][] = [[nfa.Initial, object]];

        while(traversals.length)
        {
            let [state, object] = traversals.shift();

            if(state === nfa.Final)
                yield object;

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

                            else if(value)
                                traversals.push([nextState, value]);
                        }
                    else if(property in object)
                    {
                        let value = object[property];
                        if(value instanceof Array)
                            value.forEach(element => traversals.push([nextState, element]));

                        else if(value)
                            traversals.push([nextState, value]);
                    }
        }
    }
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

                        else if(value)
                            traversals.push([nextState, [...path, [key, value]]]);
                    }
                else if(property in object)
                {
                    let value = object[property];
                    if(value instanceof Array)
                        value.forEach(element => traversals.push([nextState, [...path, [property, element]]]));

                    else if(value)
                        traversals.push([nextState, [...path, [property, value]]]);
                }
    }

    return paths;
}
