import { IClass } from "../Ontology/IClass";
import { IObjectPropertyExpression } from "../Ontology/IPropertyExpression";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";

export class LifeCycles extends Ontology
{
    LifeCycle     : IClass;
    LifeCycleStage: IClass;
    Stages        : IObjectPropertyExpression;

    constructor()
    {
        super(
            "LifeCycles",
            commonDomainObjects);

        this.LifeCycle = this.DeclareClass("LifeCycle");
        this.LifeCycle.SubClassOf(commonDomainObjects.DomainObject);
        this.LifeCycleStage = this.DeclareClass("LifeCycleStage");
        this.LifeCycleStage.SubClassOf(commonDomainObjects.DomainObject);
        this.Stages = this.DeclareObjectProperty("Stages");
    }
}

export const lifeCycles = new LifeCycles();
