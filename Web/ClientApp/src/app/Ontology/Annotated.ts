import { IAnnotated } from "./IAnnotated";
import { IAnnotation } from "./IAnnotation";

export class Annotated implements IAnnotated
{
    Annotations: IAnnotation[]

    protected constructor()
    {
    }
}
