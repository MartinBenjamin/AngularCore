import { Rule } from "../EavStore/Datalog";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";
import { PropertyExpressionWriter } from "./PropertyExpressionWriter";

class PredicateSymbolGenerator implements IPropertyExpressionSelector<string>
{
    private _next = 0;

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): string
    {
        return "Inverse_" + inverseObjectProperty.ObjectProperty.Select(this);
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

export class PropertyExpressionInterpreter implements IPropertyExpressionSelector<string>
{
    private _predicateSymbolSelector: IPropertyExpressionSelector<string> = new PropertyExpressionWriter();

    constructor(
        private readonly _rules: Rule[]
        )
    {
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): string
    {
        const predicateSymbol = inverseObjectProperty.Select(this._predicateSymbolSelector);
        if(!this._rules.find(rule => rule[0][0] == predicateSymbol))
            this._rules.push([[predicateSymbol, '?x', '?y'], [[inverseObjectProperty.ObjectProperty.Select(this._predicateSymbolSelector), '?y', '?x']]]);
        return predicateSymbol;
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): string
    {
        return objectProperty.Select(this._predicateSymbolSelector);
    }

    DataProperty(
        dataProperty: IDataProperty
        ): string
    {
        return dataProperty.Select(this._predicateSymbolSelector);
    }
}
