import { LegalEntityIdentifier } from "../LegalEntities";
import { DataComplementOf } from "../Ontology/DataComplementOf";
import { DataOneOf } from "../Ontology/DataOneOf";
import { DisjointClasses } from "../Ontology/DisjointClasses";
import { IAnnotationProperty } from "../Ontology/IAnnotationProperty";
import { IClass } from "../Ontology/IClass";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { IDataPropertyExpression, IObjectPropertyExpression } from "../Ontology/IPropertyExpression";
import { ObjectSomeValuesFrom } from "../Ontology/ObjectSomeValuesFrom";
import { Ontology } from "../Ontology/Ontology";
import { commonDomainObjects } from "./CommonDomainObjects";
import { legalEntities } from "./LegalEntities";
import { parties } from "./Parties";
import { roleIndividuals } from "./RoleIndividuals";
import { roles } from "./Roles";

export class Deals extends Ontology
{
    RestrictedfromStage    : IAnnotationProperty;
    NominalProperty        : IAnnotationProperty;
    ComponentBuildAction   : IAnnotationProperty;
    $type                  : IDataPropertyExpression;
    DealType               : IClass;
    Deal                   : IClass;
    Debt                   : IClass;
    Advisory               : IClass;
    Type                   : IObjectPropertyExpression;
    Parties                : IObjectPropertyExpression;
    Commitments            : IObjectPropertyExpression;
    Classifiers            : IObjectPropertyExpression;
    DealParty              : IClass;
    LenderParty            : IClass;
    AdvisorParty           : IClass;
    SponsorParty           : IClass;
    BorrowerParty          : IClass;
    Equity                 : IDataPropertyExpression;
    Bank                   : INamedIndividual;
    BankParty              : IClass;
    BankLenderParty        : IClass;
    BankAdvisorParty       : IClass;
    Sponsored              : IClass;
    SponsoredWhenApplicable: IClass;
    SponsorsNA             : IDataPropertyExpression;
    KeyCounterpartyRole    : IClass;
    KeyCounterparty        : IClass;
    
    public constructor()
    {
        super(
            "Deals",
            commonDomainObjects,
            roles,
            roleIndividuals,
            legalEntities,
            parties)

        this.RestrictedfromStage  = this.DeclareAnnotationProperty("RestrictedFromStage" );
        this.NominalProperty      = this.DeclareAnnotationProperty("NominalProperty"     );
        this.ComponentBuildAction = this.DeclareAnnotationProperty("ComponentBuildAction");

        this.$type = this.DeclareDataProperty("$type")

        this.DealType = this.DeclareClass("DealType");
        this.DealType.SubClassOf(commonDomainObjects.Named);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(commonDomainObjects.Named);

        this.Type        = this.Deal.DeclareObjectProperty("Type"       );
        this.Parties     = this.Deal.DeclareObjectProperty("Parties"    );
        this.Classifiers = this.Deal.DeclareObjectProperty("Classifiers");
        this.Commitments = this.Deal.DeclareObjectProperty("Commitments");

        this.Deal.SubClassOf(commonDomainObjects.Name.MinCardinality(1, new DataComplementOf(new DataOneOf([""]))))
            .Annotate(this.RestrictedfromStage, 0);

        this.Deal.SubClassOf(this.Deal.DeclareFunctionalDataProperty("Introducer").MinCardinality(1, new DataComplementOf(new DataOneOf([""]))))
            .Annotate(this.RestrictedfromStage, 0);

        this.DealParty = this.DeclareClass("DealParty");
        this.DealParty.SubClassOf(parties.PartyInRole);

        this.LenderParty   = this.DeclareClass("LenderParty"  );
        this.AdvisorParty  = this.DeclareClass("AdvisorParty" );
        this.BorrowerParty = this.DeclareClass("BorrowerParty");
        this.SponsorParty  = this.DeclareClass("SponsorParty" );

        this.LenderParty.SubClassOf(this.DealParty);
        this.AdvisorParty.SubClassOf(this.DealParty);
        this.BorrowerParty.SubClassOf(this.DealParty);
        this.SponsorParty.SubClassOf(this.DealParty);

        this.LenderParty.Define(parties.Role.HasValue(roleIndividuals.Lender));
        this.AdvisorParty.Define(parties.Role.HasValue(roleIndividuals.Advisor));
        this.BorrowerParty.Define(parties.Role.HasValue(roleIndividuals.Borrower));
        this.SponsorParty.Define(parties.Role.HasValue(roleIndividuals.Sponsor));
        this.Equity = this.SponsorParty.DeclareDataProperty("Equity");
        this.SponsorParty.SubClassOf(this.Equity.ExactCardinality(1))
            .Annotate(this.RestrictedfromStage, 0);

        this.Bank = legalEntities.LegalEntity.DeclareNamedIndividual("Bank");
        this.Bank.DataPropertyValue(commonDomainObjects.Id, LegalEntityIdentifier.Bank);

        this.BankParty        = this.DeclareClass("BankParty");
        this.BankParty.SubClassOf(this.DealParty);
        this.BankParty.Define(parties.Organisation.HasValue(this.Bank));

        this.BankLenderParty  = this.DeclareClass("BankLenderParty");
        this.BankAdvisorParty = this.DeclareClass("BankAdvisorParty");
        this.BankLenderParty.Define(this.LenderParty.Intersect(this.BankParty));
        this.BankAdvisorParty.Define(this.AdvisorParty.Intersect(this.BankParty));

        this.Sponsored = this.DeclareClass("Sponsored");
        this.Sponsored.SubClassOf(this.Deal);
        this.Sponsored.SubClassOf(new ObjectSomeValuesFrom(this.Parties, this.SponsorParty))
            .Annotate(this.RestrictedfromStage, 0)
            .Annotate(this.NominalProperty, "Sponsors");
        this.Sponsored.Annotate(this.ComponentBuildAction, "AddSponsors");

        this.SponsoredWhenApplicable = this.DeclareClass("SponsoredWhenApplicable");
        this.SponsoredWhenApplicable.SubClassOf(this.Deal);
        this.SponsorsNA = this.SponsoredWhenApplicable.DeclareDataProperty("SponsorsNA");
        this.SponsoredWhenApplicable.SubClassOf(new ObjectSomeValuesFrom(this.Parties, this.SponsorParty).Union(this.SponsorsNA.HasValue(true)))
            .Annotate(this.RestrictedfromStage, 0)
            .Annotate(this.NominalProperty, "Sponsors");
        this.SponsoredWhenApplicable.Annotate(this.ComponentBuildAction, "AddSponsors");
        this.SponsoredWhenApplicable.Annotate(this.ComponentBuildAction, "AddSponsorsNA");

        //this.KeyCounterpartyRole = this.DeclareClass("KeyCounterpartyRole");
        //this.KeyCounterparty = this.DeclareClass("KeyCounterparty");
        //this.KeyCounterparty.SubClassOf(this.DealParty);
        //this.KeyCounterparty.Define(new ObjectSomeValuesFrom(parties.Role, this.KeyCounterpartyRole));

        this.Debt = this.DeclareClass("Debt");
        this.Debt.SubClassOf(this.Deal);
        this.Debt.SubClassOf(this.Parties.MinCardinality(1, this.BorrowerParty))
            .Annotate(this.RestrictedfromStage, 0)
            .Annotate(this.NominalProperty, "Borrowers");
        this.Debt.Annotate(this.ComponentBuildAction, "AddDebtTabs");

        new DisjointClasses(this, [this.Deal, this.DealType, this.DealParty, commonDomainObjects.Classifier]);

        let ExclusivityClassifier = this.DeclareClass("ExclusivityClassifier");
        ExclusivityClassifier.SubClassOf(commonDomainObjects.Classifier);
        ExclusivityClassifier.Define(this.$type.HasValue('Web.Model.ExclusivityClassifier, Web'));

        this.Deal.SubClassOf(
            this.Classifiers.ExactCardinality(1, ExclusivityClassifier))
            .Annotate(this.RestrictedfromStage, 0)
            .Annotate(this.NominalProperty, "Exclusivity");

        //let NotExclusive = ExclusivityClassifier.DeclareNamedIndividual("NotExclusive");
        //NotExclusive.Value(commonDomainObjects.Id, ExclusivityClassifierIdentifier.No);
        //let Exclusive = ExclusivityClassifier.Intersect((new ObjectOneOf(NotExclusive) + Complement()));
        //let ExclusiveDeal = this.DeclareClass("ExclusiveDeal");
        //ExclusiveDeal.SubClassOf(this.Deal);
        //let intermediate = this.DeclareClass("Intermediate");
        //intermediate.Define(new ObjectSomeValuesFrom(this.Classifiers, Exclusive));
        //ExclusiveDeal.Define(new ObjectIntersectionOf(intermediate));

        //let Date = this.Exclusivity.DeclareDataProperty("Date");
        //Date.Range(ReservedVocabulary.DateTime).Annotate(validation.RangeValidated, null);
    }
}

export const deals = new Deals();
