import { DealStageIdentifier } from '../Deals';
import { IClass } from '../Ontology/IClass';
import { IDataPropertyExpression, IObjectPropertyExpression } from '../Ontology/IPropertyExpression';
import { Ontology } from "../Ontology/Ontology";
import { DateTime, Decimal } from "../Ontology/Xsd";
import { agreements } from './Agreements';
import { annotations } from './Annotations';
import { commonDomainObjects } from "./CommonDomainObjects";
import { quantities } from './Quantities';

export class Fees extends Ontology
{
    ExpectedReceivedDate: IDataPropertyExpression;
    Year                : IDataPropertyExpression;
    Month               : IDataPropertyExpression;
    AccrualDate         : IClass;
    HasAccrualDate      : IObjectPropertyExpression;
    Fee                 : IClass;

    constructor()
    {
        super(
            "Fees",
            commonDomainObjects,
            quantities,
            agreements,
            annotations);

        this.ExpectedReceivedDate = this.DeclareFunctionalDataProperty("ExpectedReceivedDate");
        this.ExpectedReceivedDate.Range(DateTime);

        this.Year = this.DeclareFunctionalDataProperty("Year")
        this.Year.Range(Decimal);
        this.Month = this.DeclareFunctionalDataProperty("Month")

        this.AccrualDate = this.DeclareClass("AccrualDate");
        this.AccrualDate.Define(commonDomainObjects.$type.HasValue("Web.Model.AccrualDate, Web"));
        this.AccrualDate.SubClassOf(this.Year.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.AccrualDate.SubClassOf(this.Month.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        this.Fee = this.DeclareClass("Fee");
        this.Fee.SubClassOf(quantities.QuantityValue);
        this.Fee.SubClassOf(agreements.Commitment);
        this.Fee.SubClassOf(this.ExpectedReceivedDate.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        this.Fee.SubClassOf(this.DeclareFunctionalObjectProperty("AccrualDate").ExactCardinality(1));
    }
}

export const fees = new Fees();
