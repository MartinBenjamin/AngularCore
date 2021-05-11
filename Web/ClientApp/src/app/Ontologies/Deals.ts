import { DealLifeCycleIdentifier, DealStageIdentifier } from "../Deals";
import { LegalEntityIdentifier } from "../LegalEntities";
import { DataAllValuesFrom } from "../Ontology/DataAllValuesFrom";
import { DataComplementOf } from "../Ontology/DataComplementOf";
import { DataOneOf } from "../Ontology/DataOneOf";
import { DisjointClasses } from "../Ontology/DisjointClasses";
import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression } from "../Ontology/IPropertyExpression";
import { ObjectSomeValuesFrom } from "../Ontology/ObjectSomeValuesFrom";
import { Ontology } from "../Ontology/Ontology";
import { DateTime, Decimal } from "../Ontology/Xsd";
import { agreements } from './Agreements';
import { annotations } from './Annotations';
import { commonDomainObjects } from "./CommonDomainObjects";
import { legalEntities } from "./LegalEntities";
import { lifeCycles } from "./LifeCycles";
import { parties } from "./Parties";
import { roleIndividuals } from "./RoleIndividuals";
import { roles } from "./Roles";
import { facilityAgreements } from './FacilityAgreements';

export class Deals extends Ontology
{
    readonly LifeCycle              : IObjectPropertyExpression;
    readonly DealType               : IClass;
    readonly Deal                   : IClass;
    readonly Debt                   : IClass;
    readonly Type                   : IObjectPropertyExpression;
    readonly Classifiers            : IObjectPropertyExpression;
    readonly SponsorsNA             : IDataPropertyExpression;
    readonly LenderParty            : IClass;
    readonly AdvisorParty           : IClass;
    readonly SponsorParty           : IClass;
    readonly BorrowerParty          : IClass;
    readonly Equity                 : IDataPropertyExpression;
    readonly Bank                   : INamedIndividual;
    readonly BankParty              : IClass;
    readonly BankLenderParty        : IClass;
    readonly BankAdvisorParty       : IClass;
    readonly Sponsored              : IClass;
    readonly SponsoredWhenApplicable: IClass;
    readonly NotSponsored           : IClass;
    readonly KeyCounterpartyRole    : IClass;
    readonly KeyCounterparty        : IClass;
    readonly DebtLifeCycle          : INamedIndividual;

    constructor()
    {
        super(
            "Deals",
            commonDomainObjects,
            roles,
            roleIndividuals,
            legalEntities,
            parties,
            lifeCycles,
            annotations,
            agreements,
            facilityAgreements);

        this.DealType = this.DeclareClass("DealType");
        this.DealType.SubClassOf(commonDomainObjects.Classifier);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(agreements.Agreement);

        this.LifeCycle   = this.Deal.DeclareObjectProperty("LifeCycle"  );
        this.Type        = this.Deal.DeclareObjectProperty("Type"       );
        this.Classifiers = this.Deal.DeclareObjectProperty("Classifiers");

        this.SponsorsNA = this.Deal.DeclareDataProperty("SponsorsNA");

        this.Deal.SubClassOf(this.Type.ExactCardinality(1));

        let nonEmptyString = new DataComplementOf(new DataOneOf([""]));

        this.Deal.SubClassOf(commonDomainObjects.Name.MinCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.Deal.SubClassOf(this.Deal.DeclareObjectProperty("GeographicRegion").MinCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.Deal.SubClassOf(this.Deal.DeclareObjectProperty("Currency").MinCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.Deal.SubClassOf(this.Deal.DeclareFunctionalDataProperty("Introducer").MinCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.Deal.SubClassOf(this.Deal.DeclareFunctionalDataProperty("TransactionDetails").MinCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);
        this.Deal.SubClassOf(this.Deal.DeclareFunctionalDataProperty("CurrentStatus").MinCardinality(1, nonEmptyString))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);


        let exclusivityClassifier = this.DeclareClass("ExclusivityClassifier");
        exclusivityClassifier.SubClassOf(commonDomainObjects.Classifier);
        exclusivityClassifier.Define(commonDomainObjects.$type.HasValue('Web.Model.ExclusivityClassifier, Web'));

        this.Deal.SubClassOf(this.Classifiers.ExactCardinality(1, exclusivityClassifier))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.BusinessScreened)
            .Annotate(annotations.NominalProperty, "Exclusivity");

        let exclusivity = this.DeclareClass("Exclusivity");
        exclusivity.Define(commonDomainObjects.$type.HasValue('Web.Model.Exclusivity, Web'));
        let endDate = exclusivity.DeclareFunctionalDataProperty("EndDate");
        endDate.Range(DateTime);
        exclusivity.SubClassOf(endDate.MinCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);


        this.LenderParty   = this.DeclareClass("LenderParty"  );
        this.AdvisorParty  = this.DeclareClass("AdvisorParty" );
        this.BorrowerParty = this.DeclareClass("BorrowerParty");
        this.SponsorParty  = this.DeclareClass("SponsorParty" );

        this.LenderParty.SubClassOf(parties.PartyInRole);
        this.AdvisorParty.SubClassOf(parties.PartyInRole);
        this.BorrowerParty.SubClassOf(parties.PartyInRole);
        this.SponsorParty.SubClassOf(parties.PartyInRole);

        this.LenderParty.Define(parties.Role.HasValue(roleIndividuals.Lender));
        this.AdvisorParty.Define(parties.Role.HasValue(roleIndividuals.Advisor));
        this.BorrowerParty.Define(parties.Role.HasValue(roleIndividuals.Borrower));
        this.SponsorParty.Define(parties.Role.HasValue(roleIndividuals.Sponsor));
        this.Equity = this.SponsorParty.DeclareDataProperty("Equity");
        this.Equity.Range(Decimal);
        this.SponsorParty.SubClassOf(this.Equity.ExactCardinality(1))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect);

        this.Bank = legalEntities.LegalEntity.DeclareNamedIndividual("Bank");
        this.Bank.DataPropertyValue(commonDomainObjects.Id, LegalEntityIdentifier.Bank);

        this.BankParty        = this.DeclareClass("BankParty");
        this.BankParty.SubClassOf(parties.PartyInRole);
        this.BankParty.Define(parties.Organisation.HasValue(this.Bank));

        this.BankLenderParty  = this.DeclareClass("BankLenderParty");
        this.BankAdvisorParty = this.DeclareClass("BankAdvisorParty");
        this.BankLenderParty.Define(this.LenderParty.Intersect(this.BankParty));
        this.BankAdvisorParty.Define(this.AdvisorParty.Intersect(this.BankParty));

        this.Sponsored = this.DeclareClass("Sponsored");
        this.Sponsored.SubClassOf(this.Deal);
        this.Sponsored.SubClassOf(new ObjectSomeValuesFrom(agreements.Parties, this.SponsorParty))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect)
            .Annotate(annotations.NominalProperty, "Sponsors");
        this.Sponsored.SubClassOf(this.SponsorsNA.ExactCardinality(0));
        this.Sponsored.Annotate(annotations.ComponentBuildAction, "AddSponsors");

        this.SponsoredWhenApplicable = this.DeclareClass("SponsoredWhenApplicable");
        this.SponsoredWhenApplicable.SubClassOf(this.Deal);
        this.SponsoredWhenApplicable.SubClassOf(new ObjectSomeValuesFrom(agreements.Parties, this.SponsorParty).Union(this.SponsorsNA.HasValue(true)))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect)
            .Annotate(annotations.NominalProperty, "Sponsors");
        this.SponsoredWhenApplicable.Annotate(annotations.ComponentBuildAction, "AddSponsors");
        this.SponsoredWhenApplicable.Annotate(annotations.ComponentBuildAction, "AddSponsorsNA");

        this.NotSponsored = this.DeclareClass("NotSponsored");
        this.NotSponsored.SubClassOf(this.Deal);
        this.NotSponsored.SubClassOf(agreements.Parties.ExactCardinality(0, this.SponsorParty));
        this.NotSponsored.SubClassOf(this.SponsorsNA.ExactCardinality(0));

        let sponsoredDeal = this.DeclareClass("SponsoredDeal");
        sponsoredDeal.Define(new ObjectSomeValuesFrom(agreements.Parties, this.SponsorParty));
        sponsoredDeal.SubClassOf(this.Deal);
        sponsoredDeal.SubClassOf(new DataAllValuesFrom(this.DeclareFunctionalDataProperty("TotalSponsorEquity"), new DataOneOf([100])))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect)
            .Annotate(annotations.Error, "MustBe100Percent");

        this.Debt = this.DeclareClass("Debt");
        this.Debt.SubClassOf(this.Deal);
        this.Debt.SubClassOf(agreements.Parties.MinCardinality(1, this.BorrowerParty))
            .Annotate(annotations.RestrictedfromStage, DealStageIdentifier.Prospect)
            .Annotate(annotations.NominalProperty, "Borrowers");
        this.Debt.Annotate(annotations.ComponentBuildAction, "AddDebtTabs");

        this.DebtLifeCycle = lifeCycles.LifeCycle.DeclareNamedIndividual("DebtLifeCycle");
        this.DebtLifeCycle.DataPropertyValue(commonDomainObjects.Id, DealLifeCycleIdentifier.Debt);
        this.Debt.SubClassOf(this.LifeCycle.HasValue(this.DebtLifeCycle));

        new DisjointClasses(this, [this.Deal, parties.PartyInRole, commonDomainObjects.Classifier]);
    }
}

export const deals = new Deals();
