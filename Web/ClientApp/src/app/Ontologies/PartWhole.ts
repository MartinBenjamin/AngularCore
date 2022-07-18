import { IObjectPropertyExpression } from "../Ontology/IPropertyExpression";
import { Ontology } from "../Ontology/Ontology";

export class PartWhole extends Ontology
{
    readonly PartOf: IObjectPropertyExpression;
    readonly Parts : IObjectPropertyExpression;

    constructor()
    {
        super("PartWhole");

        this.PartOf = this.DeclareFunctionalObjectProperty("PartOf");
        this.Parts  = this.DeclareObjectProperty("Parts");
    }
}

export const partWhole = new PartWhole();
