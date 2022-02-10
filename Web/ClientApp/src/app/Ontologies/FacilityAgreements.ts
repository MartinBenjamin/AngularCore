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

        const nonEmptyString = new DataComplementOf(new DataOneOf([""]));
        const facility = this.DeclareClass("Facility");
        facility.Define(commonDomainObjects.$type.HasValue("Web.Model.Facility, Web"));
        facility.SubClassOf(agreements.Commitment);

        facility.SubClassOf(commonDomainObjects.Name.ExactCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        const currency = this.DeclareFunctionalObjectProperty("Currency");
        facility.SubClassOf(currency.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        const totalCommitments = this.DeclareFunctionalDataProperty("TotalCommitments");
        totalCommitments.Range(Decimal);
        facility.SubClassOf(totalCommitments.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect)

        const availabilityPeriodEndDate = this.DeclareFunctionalDataProperty("AvailabilityPeriodEndDate");
        availabilityPeriodEndDate.Range(DateTime);

        const expected1StDrawdownDate = this.DeclareFunctionalDataProperty("Expected1StDrawdownDate");
        expected1StDrawdownDate.Range(DateTime);

        const maturityDate = this.DeclareFunctionalDataProperty("MaturityDate");
        maturityDate.Range(DateTime);

        const lenderParticipation = this.DeclareClass("LenderParticipation");
        lenderParticipation.Define(commonDomainObjects.$type.HasValue("Web.Model.LenderParticipation, Web"));

        const underwriteAmount = this.DeclareFunctionalDataProperty("UnderwriteAmount");
        underwriteAmount.Range(Decimal);

        lenderParticipation.SubClassOf(underwriteAmount.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.BusinessScreened);

        const creditSoughtLimit = this.DeclareFunctionalDataProperty("CreditSoughtLimit");
        creditSoughtLimit.Range(Decimal);

        lenderParticipation.SubClassOf(creditSoughtLimit.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.BusinessScreened);

        const anticipatedHoldAmount = this.DeclareFunctionalDataProperty("AnticipatedHoldAmount");
        anticipatedHoldAmount.Range(Decimal);

        const actualAllocation = this.DeclareFunctionalDataProperty("ActualAllocation");
        actualAllocation.Range(Decimal);

        const facilityFee = this.DeclareClass("FacilityFee");
        facilityFee.Define(commonDomainObjects.$type.HasValue('Web.Model.FacilityFee, Web'));
        facilityFee.SubClassOf(agreements.Commitment);

        const expectedReceivedDate = this.DeclareFunctionalDataProperty("ExpectedReceivedDate");
        expectedReceivedDate.Range(DateTime);

        const feeAmount = this.DeclareClass("FeeAmount");
        feeAmount.Define(commonDomainObjects.$type.HasValue("Web.Model.FeeAmount, Web"));

        const value = this.DeclareFunctionalDataProperty("Value");
        value.Range(Decimal);

        feeAmount.SubClassOf(value.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        const accrualDate = this.DeclareClass("AccrualDate");
        accrualDate.Define(commonDomainObjects.$type.HasValue("Web.Model.AccrualDate, Web"));

        const year = this.DeclareFunctionalDataProperty("Year")
        year.Range(Decimal);
        accrualDate.SubClassOf(year.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        accrualDate.SubClassOf(this.DeclareFunctionalDataProperty("Month").ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
    }
}

export const facilityAgreements = new FacilityAgreements();
