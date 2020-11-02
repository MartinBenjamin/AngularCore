import { IAnnotated } from "./IAnnotated";
import { IAnnotation } from "./IAnnotation";

export class Annotated implements IAnnotated
{
    readonly Annotations: IAnnotation[] = [];

    protected constructor()
    {
    }
}
