import { Idb, Rule, Variable } from "../EavStore/Datalog";
import { IDataProperty, IInverseObjectProperty, IObjectProperty, IProperty } from "./IProperty";
import { IPropertyExpressionSelector } from "./IPropertyExpressionSelector";

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

export class PropertyExpressionInterpreter implements IPropertyExpressionSelector<Idb>
{
    private _predicateSymbolGenerator: IPropertyExpressionSelector<string> = new PredicateSymbolGenerator();

    constructor(
        public readonly Domain: Variable,
        public readonly Range : Variable
        )
    {
    }

    InverseObjectProperty(
        inverseObjectProperty: IInverseObjectProperty
        ): Idb
    {
        return [inverseObjectProperty.Select(this._predicateSymbolGenerator), this.Range, this.Domain];
    }

    ObjectProperty(
        objectProperty: IObjectProperty
        ): Idb
    {
        return [objectProperty.Select(this._predicateSymbolGenerator), this.Domain, this.Range];
    }

    DataProperty(
        dataProperty: IDataProperty
        ): Idb
    {
        return [dataProperty.Select(this._predicateSymbolGenerator), this.Domain, this.Range];
    }
}
