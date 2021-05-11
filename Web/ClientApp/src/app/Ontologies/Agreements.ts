import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { IObjectPropertyExpression } from '../Ontology/IPropertyExpression';

export class Agreements extends Ontology
{

    readonly Agreement : IClass;
    readonly Commitment: IClass;
    readonly Parties   : IObjectPropertyExpression;
    readonly Confers   : IObjectPropertyExpression;

    constructor()
    {
        super(
            "Agreements",
            commonDomainObjects);

        this.Agreement  = this.DeclareClass("Agreement" );
        this.Commitment = this.DeclareClass("Commitment");
        this.Parties    = this.Agreement.DeclareObjectProperty("Parties");
        this.Confers    = this.Agreement.DeclareObjectProperty("Confers");
    }
}

export const agreements = new Agreements();
