import { Wrapped, WrapperType } from "../Ontology/Wrapped";
import { Atom, Rule } from "./Datalog";
import { Tuple } from "./Tuple";

export interface IDatalogInterpreter<TWrapperType extends WrapperType>
{
    Query<T extends Tuple>(
        head: [...T],
        body: Atom[],
        ...rules: Rule[]): Wrapped<TWrapperType, {[K in keyof T]: any;}[]>;

    Rules(rules: Rule[]): Map<string, Wrapped<TWrapperType, Iterable<Tuple>>>
}
