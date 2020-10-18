import { IAxiom } from "./IAxiom";
import { IIsAxiom } from './IIsAxiom'

export interface IOntology
{
    Iri    : string;
    Imports: IOntology[];
    Axioms : IAxiom[];
    IsAxiom: IIsAxiom;
    GetOntologies(): Iterable<IOntology>;
    Get<TAxiom extends IAxiom>(typeGuard: (axiom: object) => axiom is TAxiom): Iterable<TAxiom>;
}

function* i(
    ontology: IOntology)
{
    yield ontology;
}

class iter implements Iterator<IOntology>
{
    done = false;
    next(): IteratorResult<IOntology>
    {
        if(!this.done)
        {
            this.done = true;
            return {
                value: new Ontology(),
                done: false
            };
        }
        else
            return {
                value: null,
                done: true
            };
    }
}

export class Ontology implements IOntology
{
    Iri: string;
    Imports: IOntology[];
    Axioms: IAxiom[];
    IsAxiom: null;
    GetOntologies(): Iterable<IOntology>
    {
        //return {
        //    [Symbol.iterator]()
        //    {
        //        return new iter();
        //    }
        let o = this;
        return {
            *[Symbol.iterator]()
            {
                yield o;
            }
          };
    }
    Get<TAxiom extends IAxiom>(): Iterable<TAxiom>
    {
        throw new Error("Method not implemented.");
    }

}

