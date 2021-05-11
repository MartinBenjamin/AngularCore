import { DealStageIdentifier } from '../Deals';
import { DataComplementOf } from '../Ontology/DataComplementOf';
import { DataOneOf } from '../Ontology/DataOneOf';
import { Ontology } from "../Ontology/Ontology";
import { agreements } from './Agreements';
import { annotations } from './Annotations';
import { commonDomainObjects } from "./CommonDomainObjects";
import { Decimal, DateTime } from '../Ontology/Xsd';

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
        facility.Define(commonDomainObjects.$type.HasValue('Web.Model.Facility, Web'));
        facility.SubClassOf(commonDomainObjects.Named);
        facility.SubClassOf(agreements.Commitment);

        facility.SubClassOf(commonDomainObjects.Name.MinCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        let currency = facility.DeclareObjectProperty("Currency");
        facility.SubClassOf(currency.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        let totalCommitments = facility.DeclareDataProperty("TotalCommitments");
        totalCommitments.Range(Decimal);
        facility.SubClassOf(totalCommitments.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect)

        let availabilityPeriodEndDate = facility.DeclareDataProperty("AvailabilityPeriodEndDate");
        availabilityPeriodEndDate.Range(DateTime);

        let expected1StDrawdownDate = facility.DeclareDataProperty("Expected1StDrawdownDate");
        expected1StDrawdownDate.Range(DateTime);

        let maturityDate = facility.DeclareDataProperty("MaturityDate");
        maturityDate.Range(DateTime);

        let lenderParticipation = this.DeclareClass("LenderParticipation");
        facility.Define(commonDomainObjects.$type.HasValue('Web.Model.LenderParticipation, Web'));

        let underwriteAmount = lenderParticipation.DeclareDataProperty("UnderwriteAmount");
        underwriteAmount.Range(Decimal);

        let creditSoughtLimit = lenderParticipation.DeclareDataProperty("CreditSoughtLimit");
        creditSoughtLimit.Range(Decimal);
    }
}

export const facilityAgreements = new FacilityAgreements();