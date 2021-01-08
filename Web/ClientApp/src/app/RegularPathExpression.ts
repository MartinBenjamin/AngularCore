export type PathSegment = [string, object];
export type Path = PathSegment[];

type Traversal = [State, Path];
export type Transition = [string, State];

export interface State
{
    EpsilonTransitions?: State[];
    Transitions       ?: Transition[];
}

export interface Nfa
{
    Initial: State;
    Final  : State;
}

export interface IRegularPathExpression
{
    Nfa(initialState?: State): Nfa;
}

export const Empty = <IRegularPathExpression>
{
    Nfa: (
        initialState: State
        ): Nfa =>
    {
        let nfa = <Nfa>
            {
                Initial: initialState ? initialState : <State>{},
                Final  : <State>{}
            };

        nfa.Initial.EpsilonTransitions = [nfa.Final];

        return nfa;
    }
}

export class Property implements IRegularPathExpression
{
    constructor(
        public Name: string
        )
    {
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = <Nfa>
            {
                Initial: initialState ? initialState : <State>{},
                Final  : <State>{}
            };

        nfa.Initial.Transitions = [[this.Name, nfa.Final]];

        return nfa;
    }
}

export const Any = new Property('.');

export class Alternative implements IRegularPathExpression
{
    constructor(
        public RegularPathExpressions: IRegularPathExpression[]
        )
    {
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = <Nfa>
            {
                Initial: initialState ? initialState : <State>{},
                Final: <State>{}
            };

        let innerNfas = this.RegularPathExpressions.map(pathExpression => pathExpression.Nfa());
        nfa.Initial.EpsilonTransitions = innerNfas.map(innerNfa => innerNfa.Initial);
        innerNfas.forEach(innerNfa => innerNfa.Final.EpsilonTransitions = [nfa.Final]);
        return nfa;
    }
}

export class Sequence implements IRegularPathExpression
{
    constructor(
        public RegularPathExpressions: IRegularPathExpression[]
        )
    {
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = this.RegularPathExpressions[0].Nfa(initialState);
        for(let index = 1; index < this.RegularPathExpressions.length; ++index)
            nfa.Final = this.RegularPathExpressions[index].Nfa(nfa.Final).Final;
        return nfa;
    }
}

export class ZeroOrOne implements IRegularPathExpression
{
    constructor(
        public RegularPathExpression: IRegularPathExpression
        )
    {
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = <Nfa>
            {
                Initial: initialState ? initialState : <State>{},
                Final: <State>{}
            };

        let innerNfa = this.RegularPathExpression.Nfa();
        nfa.Initial.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
        innerNfa.Final.EpsilonTransitions = [nfa.Final];
        return nfa;
    }
}

export class ZeroOrMore implements IRegularPathExpression
{
    constructor(
        public RegularPathExpression: IRegularPathExpression
        )
    {
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = <Nfa>
            {
                Initial: initialState ? initialState : <State>{},
                Final: <State>{}
            };

        let innerNfa = this.RegularPathExpression.Nfa();
        nfa.Initial.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
        innerNfa.Final.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
        return nfa;
    }
}

export class OneOrMore implements IRegularPathExpression
{
    constructor(
        public RegularPathExpression: IRegularPathExpression
        )
    {
    }

    Nfa(
        initialState: State
        ): Nfa
    {
        let nfa = <Nfa>
            {
                Initial: initialState ? initialState : <State>{},
                Final: <State>{}
            };

        let innerNfa = this.RegularPathExpression.Nfa();
        nfa.Initial.EpsilonTransitions = [innerNfa.Initial];
        innerNfa.Final.EpsilonTransitions = [innerNfa.Initial, nfa.Final];
        return nfa;
    }
}

export function Query(
    object               : object,
    regularPathExpression: IRegularPathExpression
    ): Set<any>
{
    let result = new Set<any>();
    let nfa = regularPathExpression.Nfa();
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
    object               : object,
    regularPathExpression: IRegularPathExpression
    ): Path[]
{
    let paths: Path[] = [];
    let nfa = regularPathExpression.Nfa();
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
