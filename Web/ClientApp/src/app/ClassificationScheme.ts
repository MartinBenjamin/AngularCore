import { DomainObject, Guid, Named, Range } from "./CommonDomainObjects";

export interface ClassificationSchemeBase<
    TId,
    TClassificationScheme extends ClassificationSchemeBase<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>,
    TClassificationSchemeClassifier extends ClassificationSchemeClassifierBase<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>,
    TClassifier> extends DomainObject<TId>
{
    Classifiers: TClassificationSchemeClassifier[];
}

export interface ClassificationSchemeClassifierBase<
    TId,
    TClassificationScheme extends ClassificationSchemeBase<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>,
    TClassificationSchemeClassifier extends ClassificationSchemeClassifierBase<TId, TClassificationScheme, TClassificationSchemeClassifier, TClassifier>,
    TClassifier> extends DomainObject<TId>
{
    Classifier: TClassifier;                  
    Super     : TClassificationSchemeClassifier;         
    Sub       : TClassificationSchemeClassifier[]; 
    Interval  : Range<number>;    
}


export interface Classifier extends Named<Guid>
{
}

export interface ClassificationScheme extends ClassificationSchemeBase<Guid, ClassificationScheme, ClassificationSchemeClassifier, Classifier>
{
}

export interface ClassificationSchemeClassifier extends ClassificationSchemeClassifierBase<Guid, ClassificationScheme, ClassificationSchemeClassifier, Classifier>
{
}
