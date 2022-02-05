import { AnnotationProperty } from "./AnnotationProperty";
import { Class } from "./Class";
import { ClassMembershipEvaluator } from "./ClassMembershipEvaluator";
import { FunctionalDataProperty } from "./FunctionalDataProperty";
import { IAnnotationProperty } from "./IAnnotationProperty";
import { IAxiom } from "./IAxiom";
import { IClass } from "./IClass";
import { IClassExpression } from "./IClassExpression";
import { INamedIndividual } from "./INamedIndividual";
import { IOntology } from "./IOntology";
import { IDataPropertyExpression, IObjectPropertyExpression } from "./IPropertyExpression";
import { IsAxiom } from "./IsAxiom";
import { IsClassExpression } from "./IsClassExpression";
import { NamedIndividual } from "./NamedIndividual";
import { DataProperty, ObjectProperty } from "./Property";

export function Individuals(
    individual  : object,
    individuals?: Set<object>
    ): Set<object>
{
    individuals = individuals || new Set<object>();

    if(typeof individual !== "object" ||
        individual === null ||
        individual instanceof Date ||
        individuals.has(individual))
        return;

    if(individual instanceof Array)
    {
        individual.forEach(element => Individuals(
            element,
            individuals));

        return individuals;
    }

    individuals.add(individual);

    for(let propertyName in individual)
        Individuals(
            individual[propertyName],
            individuals);

    return individuals;
}

export class Ontology implements IOntology
{
    Imports           : IOntology[];
    Axioms            = [];
    IsAxiom           = new IsAxiom();
    IsClassExpression = new IsClassExpression();

    private readonly _superClasses = new Map<IClassExpression, Set<IClassExpression>>();

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

    *Get<TAxiom extends IAxiom>(
        typeGuard: (axiom: object) => axiom is TAxiom
        ): IterableIterator<TAxiom>
    {
        for(let ontology of this.GetOntologies())
            for(let axiom of ontology.Axioms)
                if(typeGuard(axiom))
                    yield axiom;
    }

    Classify(individuals: Set<object>): Map<object, Set<IClass>>;
    Classify(individual: object): Map<object, Set<IClass>>;
    Classify(individualOrIndividuals: object | Set<object>): Map<object, Set<IClass>>
    {
        let individuals = individualOrIndividuals instanceof Set ? individualOrIndividuals : Individuals(individualOrIndividuals);
        let classifications = new Map<object, Set<IClass>>()
        let classMembershipEvaluator = new ClassMembershipEvaluator(
            this,
            classifications);

        individuals.forEach(individual => classMembershipEvaluator.Classify(individual));

        return classifications;
    }

    SuperClasses(
        classExpression: IClassExpression
        ): Set<IClassExpression>
    {
        let superClasses = this._superClasses.get(classExpression);

        if(superClasses)
            return superClasses;

        superClasses = new Set<IClass>();
        this._superClasses.set(
            classExpression,
            superClasses);

        superClasses.add(classExpression);

        for(let subClassOf of this.Get(this.IsAxiom.ISubClassOf))
            if(subClassOf.SubClassExpression === classExpression)
                for(let superClass of this.SuperClasses(subClassOf.SuperClassExpression))
                    superClasses.add(superClass);

        return superClasses;
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
        new FunctionalDataProperty(
            this,
            dataProperty);
        return dataProperty;
    }

    DeclareAnnotationProperty(
        localName: string
        ): IAnnotationProperty
    {
        return new AnnotationProperty(
            this,
            localName);
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
