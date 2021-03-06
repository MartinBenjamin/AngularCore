import { IClass } from "../Ontology/IClass";
import { IDataPropertyExpression } from "../Ontology/IPropertyExpression";
import { Ontology } from "../Ontology/Ontology";

export class CommonDomainObjects extends Ontology
{
    readonly DomainObject: IClass;
    readonly Id          : IDataPropertyExpression;
    readonly Named       : IClass                 
    readonly Name        : IDataPropertyExpression;
    readonly Classifier  : IClass                 

    constructor()
    {
        super("CommonDomainObjects");

        this.DomainObject = this.DeclareClass("DomainObject");
        this.Id = this.DomainObject.DeclareFunctionalDataProperty("Id");
        this.DomainObject.HasKey([this.Id]);
        this.DomainObject.Define(this.Id.ExactCardinality(1));

        this.Named = this.DeclareClass("Named");
        this.Named.SubClassOf(this.DomainObject);
        this.Name = this.Named.DeclareFunctionalDataProperty("Name");

        this.Classifier = this.DeclareClass("Classifier");
        this.Classifier.SubClassOf(this.Named);
    }
}

export const commonDomainObjects = new CommonDomainObjects();
