import { AttributeSchema, Cardinality } from '../EavStore/IEavStore';
import { IOntology } from './IOntology';
import { IObjectProperty, IDataProperty } from './IProperty';
import { Thing } from './Thing';

export function GenerateAttributeSchema(
    ontology: IOntology
    ): AttributeSchema[]
{
    const functionalObjectProperties = new Set<IObjectProperty>(
        [...ontology.Get(ontology.IsAxiom.IFunctionalObjectProperty)]
            .map(functionalObjectProperty => functionalObjectProperty.ObjectPropertyExpression)
            .filter(ontology.IsAxiom.IObjectProperty));
    const functionalDataProperties = new Set<IDataProperty>(
        [...ontology.Get(ontology.IsAxiom.IFunctionalDataProperty)]
            .map(functionalDataProperty => <IDataProperty>functionalDataProperty.DataPropertyExpression));
    const keyProperties = new Set<IDataProperty>(
        [...ontology.Get(ontology.IsAxiom.IHasKey)]
            .filter(hasKey =>
                hasKey.ClassExpression === Thing &&
                hasKey.DataPropertyExpressions.length === 1)
            .map(hasKey => <IDataProperty>hasKey.DataPropertyExpressions[0])
            .filter(keyProperty => functionalDataProperties.has(keyProperty)));

    const attributeSchema: AttributeSchema[] = [];

    for(const keyProperty of keyProperties)
        attributeSchema.push(
            {
                Name: keyProperty.LocalName,
                UniqueIdentity: true,
                Cardinality: Cardinality.One
            });

    for(const functionalObjectProperty of functionalObjectProperties)
        attributeSchema.push(
            {
                Name: functionalObjectProperty.LocalName,
                Cardinality: Cardinality.One
            });

    for(const functionalDataProperty of functionalDataProperties)
        if(!keyProperties.has(functionalDataProperty))
            attributeSchema.push(
                {
                    Name: functionalDataProperty.LocalName,
                    Cardinality: Cardinality.One
                });

    for(const objectProperty of ontology.Get(ontology.IsAxiom.IObjectProperty))
        if(!functionalObjectProperties.has(objectProperty))
            attributeSchema.push(
                {
                    Name: objectProperty.LocalName,
                    Cardinality: Cardinality.Many
                });

    for(const dataProperty of ontology.Get(ontology.IsAxiom.IDataProperty))
        if(!functionalDataProperties.has(dataProperty))
            attributeSchema.push(
                {
                    Name: dataProperty.LocalName,
                    Cardinality: Cardinality.Many
                });

    return attributeSchema;
}
