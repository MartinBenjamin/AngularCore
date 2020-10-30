import { Class } from "./Class";
import { ClassMembershipEvaluator } from "./ClassMembershipEvaluator";
import { FunctionalDataProperty } from "./FunctionalDataProperty";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { INamedIndividual } from "./INamedIndividual";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { IsAxiom } from "./IsAxiom";
import { NamedIndividual } from "./NamedIndividual";
import { DataProperty, ObjectProperty } from "./Property";

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
        new ClassMembershipEvaluator(
            this,
            classifications).ClassifyAll(individual);

        return classifications;
    }

    DeclareClass(
        localName: string
        ): IClass
    {
        return new Class(
            this,
            localName);
    }

    DeclareObjectProperty(
        localName: string
        ): IObjectPropertyExpression
    {
        return new ObjectProperty(
            this,
            localName);
    }

    DeclareDataProperty(
        localName: string
        ): IDataPropertyExpression
    {
        return new DataProperty(
            this,
            localName);
    }

    DeclareFunctionalDataProperty(
        localName: string
        ): IDataPropertyExpression
    {
        let dataProperty = this.DeclareDataProperty(localName);
        new FunctionalDataProperty(this,
            dataProperty);
        return dataProperty;
    }

    DeclareNamedIndividual(
        localName: string
        ): INamedIndividual
    {
        return new NamedIndividual(
            this,
            localName);
    }
}
