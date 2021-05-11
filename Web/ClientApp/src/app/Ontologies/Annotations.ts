import { IAnnotationProperty } from "../Ontology/IAnnotationProperty";
import { Ontology } from "../Ontology/Ontology";

export class Annotations extends Ontology
{
    readonly RestrictedfromStage    : IAnnotationProperty;
    readonly NominalProperty        : IAnnotationProperty;
    readonly Error                  : IAnnotationProperty;
    readonly ComponentBuildAction   : IAnnotationProperty;

    constructor()
    {
        super("Annotations");

        this.RestrictedfromStage  = this.DeclareAnnotationProperty("RestrictedFromStage" );
        this.NominalProperty      = this.DeclareAnnotationProperty("NominalProperty"     );
        this.Error                = this.DeclareAnnotationProperty("Error"               );
        this.ComponentBuildAction = this.DeclareAnnotationProperty("ComponentBuildAction");
    }
}

export const annotations = new Annotations();
