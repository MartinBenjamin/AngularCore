import { DealStageIdentifier } from '../Deals';
import { IClass } from '../Ontology/IClass';
import { IDataPropertyExpression, IObjectPropertyExpression } from '../Ontology/IPropertyExpression';
import { Ontology } from "../Ontology/Ontology";
import { Decimal } from "../Ontology/Xsd";
import { annotations } from './Annotations';
import { INamedIndividual } from '../Ontology/INamedIndividual';

export class Quantities extends Ontology
{
    MeasurementUnit: IObjectPropertyExpression;
    NumericValue   : IDataPropertyExpression;
    QuantityValue  : IClass;

    constructor()
    {
        super(
            "Quantities",
            annotations);

        this.MeasurementUnit = this.DeclareFunctionalObjectProperty("MeasurementUnit");
        this.NumericValue    = this.DeclareFunctionalDataProperty("NumericValue");

        this.NumericValue.Range(Decimal);
        this.QuantityValue = this.DeclareClass("QuantityValue");

        this.QuantityValue.SubClassOf(this.MeasurementUnit.MaxCardinality(1));
        this.QuantityValue.SubClassOf(this.NumericValue.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
    }
}

export const quantities = new Quantities();
