import { DealStageIdentifier } from '../Deals';
import { DataComplementOf } from '../Ontology/DataComplementOf';
import { DataOneOf } from '../Ontology/DataOneOf';
import { Ontology } from "../Ontology/Ontology";
import { DateTime, Decimal } from "../Ontology/Xsd";
import { agreements } from './Agreements';
import { annotations } from './Annotations';
import { commonDomainObjects } from "./CommonDomainObjects";
import { currencyAmount } from './CurrencyAmount';
import { fees } from './Fees';
import { quantities } from './Quantities';

export class FacilityAgreements extends Ontology
{
    constructor()
    {
        super(
            "FacilityAgreements",
            commonDomainObjects,
            quantities,
            currencyAmount,
            agreements,
            fees,
            annotations);

        const nonEmptyString = new DataComplementOf(new DataOneOf([""]));
        const facility = this.DeclareClass("Facility");
        facility.Define(commonDomainObjects.$type.HasValue("Web.Model.Facility, Web"));
        facility.SubClassOf(agreements.Commitment);
        facility.SubClassOf(currencyAmount.MonetaryAmount);

        facility.SubClassOf(commonDomainObjects.Name.ExactCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

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
        facilityFee.Define(commonDomainObjects.$type.HasValue("Web.Model.FacilityFee, Web"));
        facilityFee.SubClassOf(fees.Fee);

        const externalFunding = this.DeclareClass("ExternalFunding");
        externalFunding.Define(commonDomainObjects.$type.HasValue("Web.Model.ExternalFunding, Web"));
        externalFunding.SubClassOf(agreements.Commitment);
        externalFunding.SubClassOf(quantities.QuantityValue);
        externalFunding.SubClassOf(agreements.Obligors.MinCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
    }
}

export const facilityAgreements = new FacilityAgreements();
