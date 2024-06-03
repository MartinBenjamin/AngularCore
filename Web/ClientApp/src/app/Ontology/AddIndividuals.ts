import { IClass } from "./IClass";
import { IIndividual } from "./IIndividual";
import { IOntology } from "./IOntology";
import { IDataProperty } from "./IProperty";

export function AddIndividual(
    ontology  : IOntology,
    individual: IIndividual,
    store     : { Assert(object: object): any }
    ): any
{
    const object = {};
    for(const dataPropertyAssertion of ontology.Get(ontology.IsAxiom.IDataPropertyAssertion))
        if(dataPropertyAssertion.SourceIndividual === individual)
        {
            const propertyName = (<IDataProperty>dataPropertyAssertion.DataPropertyExpression).LocalName;
            if(typeof object[propertyName] === 'undefined')
            {
                let functional = false;
                for(const functionalDataProperty of ontology.Get(ontology.IsAxiom.IFunctionalDataProperty))
                    if(functionalDataProperty.DataPropertyExpression === dataPropertyAssertion.DataPropertyExpression)
                    {
                        functional = true;
                        break;
                    }

                    if(!functional)
                        object[propertyName] = [];
            }

            if(object[propertyName] instanceof Array)
                object[propertyName].push(dataPropertyAssertion.TargetValue);

            else
                object[propertyName] = dataPropertyAssertion.TargetValue;
        }

    const types = [...ontology.Get(ontology.IsAxiom.IClassAssertion)]
        .filter(classAssertion => classAssertion.Individual === individual && ontology.IsClassExpression.IClass(classAssertion.ClassExpression))
        .map(classAssertion => <IClass>classAssertion.ClassExpression)
        .map(class$ => class$.Iri);

    if(types.length)
        object['rdf:type'] = types;

    return store.Assert(object);
}

export function AddIndividuals(
    ontology: IOntology,
    store   : { Assert(object: object): any }
    ): Map<IIndividual, any>
{
    const map = new Map<IIndividual, any>();
    for(const namedIndividual of ontology.Get(ontology.IsAxiom.INamedIndividual))
    {
        const entity = AddIndividual(
            ontology,
            namedIndividual,
            store);

        map.set(
            namedIndividual,
            entity);
    }

    return map;
}
