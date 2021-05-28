import { IAnnotation } from "./IAnnotation";
import { IAnnotationAxiom } from "./IAnnotationAxiom";
import { IEntity } from "./IEntity";

export interface IAnnotationAssertion extends IAnnotationAxiom, IAnnotation
{
    Subject: IEntity;
}
