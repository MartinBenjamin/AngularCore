import { Rule, Variable } from "../EavStore/Datalog";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export type PropertyAtom = [PredicateSymbol: string, Domain: any, Range: any];

export class PropertyExpressionInterpreter implements IPropertyExpressionSelector<PropertyAtom>
{
    constructor(
        public readonly Domain: Variable,
        public readonly Range : Variable,
        private _rules : Rule[]
        )
    {
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): PropertyAtom
    {
        const predicateSymbol = this.InversePredicateSymbol(inverseObjectProperty.ObjectProperty);
        if(!this._rules.find(([head,]) => head[0] === predicateSymbol))
            this._rules.push([[predicateSymbol, this.Range, this.Domain], [inverseObjectProperty.ObjectProperty.Select(this)]]);
        return [predicateSymbol, this.Domain, this.Range];
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): PropertyAtom
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): PropertyAtom
    {
        return this.Property(dataProperty);
    }

    private Property(
        property: IProperty
        ): PropertyAtom
    {
        return [property.Iri, this.Domain, this.Range];
    }

    private InversePredicateSymbol(
        objectProperty: IObjectProperty
        ): string
    {
        return null;
    }
}
