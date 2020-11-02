import { IAnnotated } from "./IAnnotated";
import { IAnnotation } from "./IAnnotation";
import { IAnnotationProperty } from "./IAnnotationProperty";

export class Annotated implements IAnnotated
{
    readonly Annotations: IAnnotation[] = [];

    protected constructor()
    {
    }

    Annotate(
        property: IAnnotationProperty,
        value   : any): IAnnotation
    {
        let annotation = new Annotation(
            property,
            value);

        this.Annotations.push(annotation);
        return annotation;
    }
}

export class Annotation
    extends Annotated
    implements IAnnotation
{
    constructor(
        public Property: IAnnotationProperty,
        public Value   : any
        )
    {
        super();
    }
}
