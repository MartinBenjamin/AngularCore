import { HasKey } from '../Ontology/HasKey';
import { IClass } from "../Ontology/IClass";
import { IDataPropertyExpression } from "../Ontology/IPropertyExpression";
import { Ontology } from "../Ontology/Ontology";
import { Thing } from '../Ontology/Thing';

export class CommonDomainObjects extends Ontology
{
    readonly $type       : IDataPropertyExpression;
    readonly Id          : IDataPropertyExpression;
    readonly DomainObject: IClass;
    readonly Named       : IClass                 
    readonly Name        : IDataPropertyExpression;
    readonly Classifier  : IClass                 

    constructor()
    {
        super("CommonDomainObjects");

        this.$type = this.DeclareFunctionalDataProperty("$type")

        this.Id = this.DeclareFunctionalDataProperty("Id");
        new HasKey(
            this,
            Thing,
            [this.Id]);
        this.DomainObject = this.DeclareClass("DomainObject");
        this.DomainObject.Define(this.Id.ExactCardinality(1));

        this.Named = this.DeclareClass("Named");
        this.Named.SubClassOf(this.DomainObject);
        this.Name = this.DeclareFunctionalDataProperty("Name");

        this.Classifier = this.DeclareClass("Classifier");
        this.Classifier.SubClassOf(this.Named);
    }
}

export const commonDomainObjects = new CommonDomainObjects();
