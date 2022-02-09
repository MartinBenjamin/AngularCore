import { IClass } from "../Ontology/IClass";
import { IObjectPropertyExpression } from '../Ontology/IPropertyExpression';
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";

export class Agreements extends Ontology
{

    readonly Agreement : IClass;
    readonly Commitment: IClass;
    readonly Parties   : IObjectPropertyExpression;
    readonly Confers   : IObjectPropertyExpression;
    readonly Obligors  : IObjectPropertyExpression;

    constructor()
    {
        super(
            "Agreements",
            commonDomainObjects);

        this.Agreement  = this.DeclareClass("Agreement" );
        this.Commitment = this.DeclareClass("Commitment");
        this.Parties    = this.DeclareObjectProperty("Parties");
        this.Confers    = this.DeclareObjectProperty("Confers");
        this.Obligors   = this.DeclareObjectProperty("Obligors");
    }
}

export const agreements = new Agreements();
