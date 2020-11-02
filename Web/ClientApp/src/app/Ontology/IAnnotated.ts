import { IAnnotation } from "./IAnnotation";
import { IAnnotationProperty } from "./IAnnotationProperty";

export interface IAnnotated
{
    readonly Annotations: IAnnotation[];

    Annotate(
        property: IAnnotationProperty,
        value   : any): IAnnotation;
}
