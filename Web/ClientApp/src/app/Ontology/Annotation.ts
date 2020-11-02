import { Annotated } from "./Annotated";
import { IAnnotation } from "./IAnnotation";
import { IAnnotationProperty } from "./IAnnotationProperty";

export class Annotation
    extends Annotated
    implements IAnnotation
{
    constructor(
        public Property: IAnnotationProperty,
        public Value   : object
        )
    {
        super();
    }
}
