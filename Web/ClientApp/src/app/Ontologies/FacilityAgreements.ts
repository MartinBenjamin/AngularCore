import { DealStageIdentifier } from '../Deals';
import { DataComplementOf } from '../Ontology/DataComplementOf';
import { DataOneOf } from '../Ontology/DataOneOf';
import { Ontology } from "../Ontology/Ontology";
import { agreements } from './Agreements';
import { annotations } from './Annotations';
import { commonDomainObjects } from "./CommonDomainObjects";
import { Decimal, DateTime } from "../Ontology/Xsd";

export class FacilityAgreements extends Ontology
{
    constructor()
    {
        super(
            "FacilityAgreements",
            agreements,
            annotations);

        let nonEmptyString = new DataComplementOf(new DataOneOf([""]));
        let facility = this.DeclareClass("Facility");
        facility.Define(commonDomainObjects.$type.HasValue("Web.Model.Facility, Web"));
        facility.SubClassOf(commonDomainObjects.Named);
        facility.SubClassOf(agreements.Commitment);

        facility.SubClassOf(commonDomainObjects.Name.MinCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        let currency = this.DeclareObjectProperty("Currency");
        facility.SubClassOf(currency.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        let totalCommitments = this.DeclareDataProperty("TotalCommitments");
        totalCommitments.Range(Decimal);
        facility.SubClassOf(totalCommitments.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect)

        let availabilityPeriodEndDate = this.DeclareDataProperty("AvailabilityPeriodEndDate");
        availabilityPeriodEndDate.Range(DateTime);

        let expected1StDrawdownDate = this.DeclareDataProperty("Expected1StDrawdownDate");
        expected1StDrawdownDate.Range(DateTime);

        let maturityDate = this.DeclareDataProperty("MaturityDate");
        maturityDate.Range(DateTime);

        let lenderParticipation = this.DeclareClass("LenderParticipation");
        lenderParticipation.Define(commonDomainObjects.$type.HasValue("Web.Model.LenderParticipation, Web"));

        let underwriteAmount = this.DeclareDataProperty("UnderwriteAmount");
        underwriteAmount.Range(Decimal);

        lenderParticipation.SubClassOf(underwriteAmount.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.BusinessScreened);

        let creditSoughtLimit = this.DeclareDataProperty("CreditSoughtLimit");
        creditSoughtLimit.Range(Decimal);

        lenderParticipation.SubClassOf(creditSoughtLimit.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.BusinessScreened);

        let anticipatedHoldAmount = this.DeclareDataProperty("AnticipatedHoldAmount");
        anticipatedHoldAmount.Range(Decimal);

        let actualAllocation = this.DeclareDataProperty("ActualAllocation");
        actualAllocation.Range(Decimal);

        let facilityFee = this.DeclareClass("FacilityFee");
        facilityFee.Define(commonDomainObjects.$type.HasValue('Web.Model.facilityFee, Web'));
        facilityFee.SubClassOf(agreements.Commitment);

        let expectedReceivedDate = this.DeclareDataProperty("ExpectedReceivedDate");
        expectedReceivedDate.Range(DateTime);

        let feeAmount = this.DeclareClass("FeeAmount");
        feeAmount.Define(commonDomainObjects.$type.HasValue('Web.Model.FeeAmount, Web'))

        let value = this.DeclareDataProperty("Value");
        value.Range(Decimal);

        feeAmount.SubClassOf(value.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
    }
}

export const facilityAgreements = new FacilityAgreements();
