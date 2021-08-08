import { IIndividual } from "./IIndividual";
import { IOntology } from "./IOntology";

export function AddIndividuals(
    ontology: IOntology,
    store   : { Add(object: object): any }
    ): Map<IIndividual, any>
{
    const map = new Map<IIndividual, any>();
    for(const namedIndividual of ontology.Get(ontology.IsAxiom.INamedIndividual))
    {
        const object = {};
        for(const dataPropertyAssertion of ontology.Get(ontology.IsAxiom.IDataPropertyAssertion))
            if(dataPropertyAssertion.SourceIndividual === namedIndividual)
            {
                const propertyName = dataPropertyAssertion.DataPropertyExpression.LocalName;
                if(typeof object[propertyName] === 'undefined' &&
                    !this._functionalDataProperties.has(dataPropertyAssertion.DataPropertyExpression))
                    object[propertyName] = [];

                if(object[propertyName] instanceof Array)
                    object[propertyName].push(dataPropertyAssertion.TargetValue);

                else
                    object[propertyName] = dataPropertyAssertion.TargetValue;
            }

        map.set(
            namedIndividual,
            store.Add(object));
    }

    return map;
}
