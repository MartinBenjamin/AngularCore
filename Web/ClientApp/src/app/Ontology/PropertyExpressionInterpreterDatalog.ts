import { Atom } from "../EavStore/Datalog";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export class PropertyExpressionInterpreter implements IPropertyExpressionSelector<Atom>
{
    //private _equivalentObjectProperties: ReadonlyMap<IObjectPropertyExpression, Set<IObjectPropertyExpression>>;
    //private _equivalentDataProperties  : ReadonlyMap<IDataProperty  , Set<IDataProperty  >>;

    constructor(
        //private _ontology              : IOntology,
        //private _propertyInterpretation: Map<IPropertyExpression, Atom>,
        //private _rules                 : Rule[]
        )
    {
        // Refexive closure.
        //const objectProperties                      = [...this._ontology.Get(this._ontology.IsAxiom.IObjectProperty)];
        //const objectPropertyExpressionAdjacencyList = new Map<IObjectPropertyExpression, Set<IObjectPropertyExpression>>(objectProperties.map(objectProperty => [objectProperty, new Set<IObjectPropertyExpression>([objectProperty])]));

        //for(const equivalentOjectPropertyExpressions of this._ontology.Get(this._ontology.IsAxiom.IEquivalentObjectProperties))
        //{
        //    for(const objectPropertyExpression1 of equivalentOjectPropertyExpressions.ObjectPropertyExpressions)
        //        for(const objectPropertyExpression2 of equivalentOjectPropertyExpressions.ObjectPropertyExpressions)
        //            objectPropertyExpressionAdjacencyList.get(objectPropertyExpression1).add(objectPropertyExpression2);
        //}

        //this._equivalentObjectProperties = TransitiveClosure3(objectPropertyExpressionAdjacencyList);

        //objectPropertyAdjacencyList = new Map<IObjectProperty, Set<IObjectProperty>>(objectProperties.map(objectProperty => [objectProperty, new Set<IObjectProperty>()]));
        //for(const subObjectPropertyOf of [...this._ontology.Get(this._ontology.IsAxiom.ISubObjectPropertyOf)]
        //    .filter(subObjectPropertyOf => this._ontology.IsAxiom.IObjectProperty(subObjectPropertyOf.SuperObjectPropertyExpression)))
        //{
        //    objectPropertyAdjacencyList.get(<IObjectProperty>subObjectPropertyOf.SuperObjectPropertyExpression).add(subObjectPropertyOf.SuperObjectPropertyExpression)
        //}


        // Refexive closure.
    //    const dataProperties            = [...this._ontology.Get(this._ontology.IsAxiom.IDataProperty)];
    //    const dataPropertyAdjacencyList = new Map<IDataProperty, Set<IDataProperty>>(dataProperties.map(dataProperty => [dataProperty, new Set<IDataProperty>([dataProperty])]));

    //    for(const equivalentDataPropertyExpressions of this._ontology.Get(this._ontology.IsAxiom.IEquivalentDataProperties))
    //    {
    //        const equivalentDataProperties = equivalentDataPropertyExpressions.DataPropertyExpressions.filter(this._ontology.IsAxiom.IDataProperty);
    //        for(const dataProperty1 of equivalentDataProperties)
    //            for(const dataProperty2 of equivalentDataProperties)
    //                dataPropertyAdjacencyList.get(dataProperty1).add(dataProperty2);
    //    }

    //    this._equivalentDataProperties = TransitiveClosure3(dataPropertyAdjacencyList);

    //    this._rules.push(...[...this._ontology.Get(this._ontology.IsAxiom.ISubObjectPropertyOf)]
    //        .filter(subObjectPropertyOf => this._ontology.IsAxiom.IObjectProperty(subObjectPropertyOf.SuperObjectPropertyExpression))
    //        .map(subObjectPropertyOf => <Rule>[[(<IObjectProperty>subObjectPropertyOf.SuperObjectPropertyExpression).LocalName, '?domain', '?range'], [subObjectPropertyOf.SubObjectPropertyExpression.Select(this)]]));
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): Atom
    {
        return [inverseObjectProperty.ObjectProperty.LocalName, '?y', '?x'];
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Atom
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Atom
    {
        return this.Property(dataProperty);
    }

    private Property(
        property: IProperty
        ): Atom
    {
        return [property.LocalName, '?x', '?y'];
    }
}
