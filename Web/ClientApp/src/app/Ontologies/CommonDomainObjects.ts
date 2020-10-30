import { IClass } from "../Ontology/IClass";
import { Ontology } from "../Ontology/Ontology";
import { IDataPropertyExpression } from "../Ontology/IPropertyExpression";

export class CommonDomainObjects extends Ontology
{
    DomainObject: IClass;
    Id          : IDataPropertyExpression;
    Named       : IClass                 
    Name        : IDataPropertyExpression;
    Classifier  : IClass                 

    constructor()
    {
        super("CommonDomainObjects");

        this.DomainObject = this.DeclareClass("DomainObject");
        this.Id = this.DomainObject.DeclareFunctionalDataProperty("Id");
        this.DomainObject.HasKey([this.Id]);

        this.Named = this.DeclareClass("Named");
        this.Named.SubClassOf(this.DomainObject);
        this.Name = this.Named.DeclareFunctionalDataProperty("Name");

        this.Classifier = this.DeclareClass("Classifier");
        this.Classifier.SubClassOf(this.Named);
    }
}
