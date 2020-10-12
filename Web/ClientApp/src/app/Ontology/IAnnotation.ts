import { IAnnotated } from "./IAnnotated";
import { IAnnotationProperty } from "./IAnnotationProperty";

export interface IAnnotation extends IAnnotated
{
    readonly Property: IAnnotationProperty;
    readonly Value   : object;
}
