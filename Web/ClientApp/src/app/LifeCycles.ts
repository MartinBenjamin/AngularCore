import { Classifier } from "./ClassificationScheme";
import { DomainObject, Guid } from "./CommonDomainObjects";

export interface LifeCycleStage extends Classifier
{
}

export interface LifeCycle extends DomainObject<Guid>
{
    Stages: LifeCycleStage[];
}
