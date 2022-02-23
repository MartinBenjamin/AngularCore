import { AccrualDateMonths } from '../Components/AccrualDate';
import { DealStageIdentifier } from '../Deals';
import { ObjectIntersectionOf } from '../Ontology/ClassExpression';
import { DataOneOf } from '../Ontology/DataOneOf';
import { IClass } from '../Ontology/IClass';
import { IDataPropertyExpression, IObjectPropertyExpression } from '../Ontology/IPropertyExpression';
import { Ontology } from '../Ontology/Ontology';
import { DateTime, Decimal } from '../Ontology/Xsd';
import { agreements } from './Agreements';
import { annotations } from './Annotations';
import { commonDomainObjects } from './CommonDomainObjects';
import { quantities } from './Quantities';
import { time } from './Time';

export class Fees extends Ontology
{
    ExpectedReceivedDate: IDataPropertyExpression;
    AccrualDate         : IClass;
    HasAccrualDate      : IObjectPropertyExpression;
    Fee                 : IClass;
    AccruedFee          : IClass;

    constructor()
    {
        super(
            "Fees",
            commonDomainObjects,
            quantities,
            time,
            agreements,
            annotations);

        this.ExpectedReceivedDate = this.DeclareFunctionalDataProperty("ExpectedReceivedDate");
        this.ExpectedReceivedDate.Range(DateTime);

        this.HasAccrualDate = this.DeclareFunctionalObjectProperty("AccrualDate");

        this.AccrualDate = this.DeclareClass("AccrualDate");
        this.AccrualDate.Define(commonDomainObjects.$type.HasValue("Web.Model.AccrualDate, Web"));
        this.AccrualDate.SubClassOf(time.Year.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.AccrualDate.SubClassOf(time.Month.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.AccrualDate.SubClassOf(time.Day.HasValue(1));

        this.Fee = this.DeclareClass("Fee");
        this.Fee.SubClassOf(quantities.QuantityValue);
        this.Fee.SubClassOf(agreements.Commitment);
        this.Fee.SubClassOf(this.ExpectedReceivedDate.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        this.AccruedFee = this.DeclareClass("AccruedFee");
        this.AccruedFee.Define(
            new ObjectIntersectionOf(
                [
                    this.ExpectedReceivedDate.ExactCardinality(1, DateTime),
                    this.HasAccrualDate.ExactCardinality(1,
                        new ObjectIntersectionOf(
                            [
                                time.Year.ExactCardinality(1, Decimal),
                                time.Month.ExactCardinality(1, new DataOneOf(AccrualDateMonths)),
                                time.Day.HasValue(1)
                            ]))
                ]));
    }
}

export const fees = new Fees();
