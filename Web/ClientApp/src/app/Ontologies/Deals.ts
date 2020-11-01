import { Ontology } from "../Ontology/Ontology";
import { IClass } from "../Ontology/IClass";
import { IObjectPropertyExpression, IDataPropertyExpression } from "../Ontology/IPropertyExpression";
import { INamedIndividual } from "../Ontology/INamedIndividual";
import { commonDomainObjects } from "./CommonDomainObjects";
import { roles } from "./Roles";
import { legalEntities } from "./LegalEntities";
import { parties } from "./Parties";
import { roleIndividuals } from "./RoleIndividuals";
import { DataSomeValuesFrom } from "../Ontology/DataSomeValuesFrom";
import { DataComplementOf } from "../Ontology/DataComplementOf";
import { DataOneOf } from "../Ontology/DataOneOf";

export class Deals extends Ontology {
    
    DealType           : IClass;
    Deal               : IClass;
    Debt               : IClass;
    Advisory           : IClass;
    Type               : IObjectPropertyExpression;
    Parties            : IObjectPropertyExpression;
    Commitments        : IObjectPropertyExpression;
    Classifiers        : IObjectPropertyExpression;
    Borrowers          : IObjectPropertyExpression;
    Sponsors           : IObjectPropertyExpression;
    Exclusivity        : IObjectPropertyExpression;
    DealParty          : IClass;
    LenderParty        : IClass;
    AdvisorParty       : IClass;
    SponsorParty       : IClass;
    BorrowerParty      : IClass;
    Sponsor            : IClass;
    Equity             : IDataPropertyExpression;
    Bank               : INamedIndividual;
    BankParty          : IClass;
    BankLenderParty    : IClass;
    BankAdvisorParty   : IClass;
    KeyCounterpartyRole: IClass;
    KeyCounterparty    : IClass;
    
    public constructor()
    {
        super(
            "Deals",
            commonDomainObjects,
            roles,
            roleIndividuals,
            legalEntities,
            parties)

        this.DealType = this.DeclareClass("DealType");
        this.DealType.SubClassOf(commonDomainObjects.Named);

        this.Deal = this.DeclareClass("Deal");
        this.Deal.SubClassOf(commonDomainObjects.Named);

        this.Type        = this.Deal.DeclareObjectProperty("Type");
        this.Parties     = this.Deal.DeclareObjectProperty("Parties");
        this.Classifiers = this.Deal.DeclareObjectProperty("Classifiers");
        this.Commitments = this.Deal.DeclareObjectProperty("Commitments");
        this.Borrowers   = this.Deal.DeclareObjectProperty("Borrowers");
        this.Sponsors    = this.Deal.DeclareObjectProperty("Sponsors");
        this.Exclusivity = this.Deal.DeclareObjectProperty("Exclusivity");

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
        
        this.Sponsor = this.DeclareClass("Sponsor");
        this.Sponsor.SubClassOf(this.SponsorParty);
        this.Equity = this.Sponsor.DeclareDataProperty("Equity");

        this.Bank = legalEntities.LegalEntity.DeclareNamedIndividual("Bank");
        this.BankParty = this.DeclareClass("BankParty");
        this.BankParty.SubClassOf(this.DealParty);
        this.BankParty.Define(parties.Organisation.HasValue(this.Bank));

        this.BankLenderParty = this.DeclareClass("BankLenderParty");
        this.BankAdvisorParty = this.DeclareClass("BankAdvisorParty");
        //this.BankLenderParty.Define(this.LenderParty.Intersect(this.BankParty));
        //this.BankAdvisorParty.Define(this.AdvisorParty.Intersect(this.BankParty));
        //this.BankLenderParty.SubClassOf(this.DealParty);  // Should be able to infer this.
        //this.BankAdvisorParty.SubClassOf(this.DealParty);  // Should be able to infer this.
        //this.KeyCounterpartyRole = this.DeclareClass("KeyCounterpartyRole");
        //this.KeyCounterparty = this.DeclareClass("KeyCounterparty");
        //this.KeyCounterparty.SubClassOf(this.DealParty);
        //this.KeyCounterparty.Define(new ObjectSomeValuesFrom(parties.Role, this.KeyCounterpartyRole));
        //this.Debt = this.DeclareClass("Debt");
        //this.Debt.SubClassOf(this.Deal);
        //this.Debt.SubClassOf(this.Parties.ExactCardinality(1, this.BankLenderParty));
        //this.Debt.SubClassOf(this.Borrowers.MinCardinality(1)).Annotate(validation.Restriction, 0);
        //new DisjointClasses(this, this.Deal, this.DealType, this.DealParty, commonDomainObjects.Classifier);
        //let ExclusivityClassifier = this.DeclareClass();
        //ExclusivityClassifier.SubClassOf(commonDomainObjects.Classifier);
        //this.Deal.SubClassOf(this.Classifiers.ExactCardinality(1, ExclusivityClassifier)).Annotate(validation.Restriction, 0).Annotate(validation.SubPropertyName, "Exclusivity");
        //let NotExclusive = ExclusivityClassifier.DeclareNamedIndividual("NotExclusive");
        //NotExclusive.Value(commonDomainObjects.Id, ExclusivityClassifierIdentifier.No);
        //let Exclusive = ExclusivityClassifier.Intersect((new ObjectOneOf(NotExclusive) + Complement()));
        //let ExclusiveDeal = this.DeclareClass("ExclusiveDeal");
        //ExclusiveDeal.SubClassOf(this.Deal);
        //let intermediate = this.DeclareClass("Intermediate");
        //intermediate.Define(new ObjectSomeValuesFrom(this.Classifiers, Exclusive));
        //ExclusiveDeal.Define(new ObjectIntersectionOf(intermediate));
        //let Exclusivity = this.DeclareClass();
        //let Date = this.Exclusivity.DeclareDataProperty<Exclusivity, DateTime?>(() => {  }, exclusivity.Date);
        //Date.Range(ReservedVocabulary.DateTime).Annotate(validation.RangeValidated, null);
    }
}
