import { ClassMembershipEvaluator } from "./ClassMembershipEvaluator";
import { IAxiom } from "./IAxiom";
import { IOntology } from "./IOntology";
import { IsAxiom } from "./IsAxiom";
import { IClass } from "./IClass";
import { IObjectPropertyDomain } from "./IObjectPropertyDomain";

export class Ontology implements IOntology
{
    Imports : IOntology[];
    Axioms  = [];
    IsAxiom = new IsAxiom();

    constructor(
        public Iri: string,
        ...imports: IOntology[]
        )
    {
        this.Imports = imports;
    }

    GetOntologies(): Iterable<IOntology>
    {
        let ontologies: IOntology[] = [this];
        for(let imported of this.Imports)
            ontologies.push(...imported.GetOntologies());

        return new Set(ontologies);
    }

    Get<TAxiom extends IAxiom>(
        typeGuard: (axiom: object) => axiom is TAxiom
        ): Iterable<TAxiom>
    {
        let current = this;
        return {
            *[Symbol.iterator]()
            {
                for(let ontology of current.GetOntologies())
                    for(let axiom of ontology.Axioms)
                        if(typeGuard(axiom))
                            yield axiom;
            }
        };
    }

    Classify(
        individual: object
        ) : Map<object, Set<IClass>>
    {
        let classifications = new Map<object, Set<IClass>>()
        let evaluator = new ClassMembershipEvaluator(
            this,
            classifications);

        this.Classify_(
            evaluator,
            individual);

        return classifications;
    }

    private Classify_(
        evaluator : ClassMembershipEvaluator,
        individual: object,
        ): void
    {
        for(let class$ of evaluator.Classify(individual))
            for(let objectPropertyDomain of this.Get(this.IsAxiom.IObjectPropertyDomain))
                if(objectPropertyDomain.Domain === class$)
                    for(let value of evaluator.ObjectPropertyValues(
                        objectPropertyDomain.ObjectPropertyExpression,
                        individual))
                        this.Classify_(
                            evaluator,
                            value);
    }
}
