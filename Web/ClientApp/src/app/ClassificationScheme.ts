import { DomainObject, Guid, Named, Range } from "./CommonDomainObjects";

export interface Classifier extends Named<Guid>
{
}

export interface ClassificationScheme extends DomainObject<Guid>
{
    Classifiers: ClassificationSchemeClassifier[];
}

export interface ClassificationSchemeClassifier extends DomainObject<Guid>
{
    Classifier: Classifier;
    Super     : ClassificationSchemeClassifier;
    Sub       : ClassificationSchemeClassifier[];
    Interval  : Range<number>;
}
