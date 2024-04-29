import { Rule, Variable } from "../EavStore/Datalog";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

export type PropertyAtom = [PredicateSymbol: string, Domain: any, Range: any];

class PredicateSymbolGenerator implements IPropertyExpressionSelector<string>
{
    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): string
    {
        return 'Inverse' + inverseObjectProperty.ObjectProperty.Select(this);
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): string
    {
        return this.Property(objectProperty);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): string
    {
        return this.Property(dataProperty);
    }

    Property(
        property: IProperty
        ): string
    {
        return property.Iri;
    }
}

export class PropertyExpressionInterpreter implements IPropertyExpressionSelector<PropertyAtom>
{
    private _predicateSymbolGenerator: IPropertyExpressionSelector<string> = new PredicateSymbolGenerator();

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
        const predicateSymbol = inverseObjectProperty.Select(this._predicateSymbolGenerator);
        if(!this._rules.find(([head,]) => head[0] === predicateSymbol))
            this._rules.push([[predicateSymbol, this.Range, this.Domain], [inverseObjectProperty.ObjectProperty.Select(this)]]);
        return [predicateSymbol, this.Domain, this.Range];
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): PropertyAtom
    {
        return [objectProperty.Select(this._predicateSymbolGenerator), this.Domain, this.Range];
    }

    DataProperty(
        dataProperty: IDataProperty
        ): PropertyAtom
    {
        return [dataProperty.Select(this._predicateSymbolGenerator), this.Domain, this.Range];
    }
}
