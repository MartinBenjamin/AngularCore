import { Atom } from "./Datalog";

export class Not
{
    constructor(
        public readonly Atoms: Atom[]
        )
    {
    }
}
