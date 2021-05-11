import { DealStageIdentifier } from '../Deals';
import { DataComplementOf } from '../Ontology/DataComplementOf';
import { DataOneOf } from '../Ontology/DataOneOf';
import { Ontology } from "../Ontology/Ontology";
import { agreements } from './Agreements';
import { annotations } from './Annotations';
import { commonDomainObjects } from "./CommonDomainObjects";

export class FacilityAgreements extends Ontology
{
    constructor()
    {
        super(
            "FacilityAgreements",
            agreements,
            annotations);

        let facility = this.DeclareClass("Facility");
        facility.Define(commonDomainObjects.$type.HasValue('Web.Model.Facility, Web'));
        facility.SubClassOf(agreements.Commitment);

        let nonEmptyString = new DataComplementOf(new DataOneOf([""]));

        facility.SubClassOf(commonDomainObjects.Name.MinCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
    }
}

export const facilityAgreements = new FacilityAgreements();
