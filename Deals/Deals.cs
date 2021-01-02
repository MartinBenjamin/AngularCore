using CommonDomainObjects;
using LegalEntities;
using Organisations;
using Ontology;
using Roles;
using System;
using System.Collections.Generic;
using System.Linq;
using Parties;
using People;
using Agreements;

namespace Deals
{
    public static class LegalEntityIdentifier
    {
        public static readonly Guid Mufg = Guid.Empty;
    }

    public class CommonDomainObjects: Ontology.Ontology
    {
        public IClass                  DomainObject { get; protected set; }
        public IDataPropertyExpression Id           { get; protected set; }
        public IClass                  Named        { get; protected set; }
        public IDataPropertyExpression Name         { get; protected set; }
        public IClass                  Classifier   { get; protected set; }

        public CommonDomainObjects() : base("CommonDomainObjects")
        {
            DomainObject = this.DeclareClass<DomainObject<Guid>>();
            Id = DomainObject.DeclareDataProperty<DomainObject<Guid>, Guid>(domainObject => domainObject.Id);
            DomainObject.HasKey(Id);

            Named = this.DeclareClass<Named<Guid>>();
            Named.SubClassOf(DomainObject);
            Name = Named.DeclareDataProperty<Named<Guid>, string>(named => named.Name);

            Classifier = this.DeclareClass<Classifier>();
            Classifier.SubClassOf(Named);
        }
    }

    public class Validation: Ontology.Ontology
    {
        public IAnnotationProperty Restriction     { get; protected set; }
        public IAnnotationProperty SubPropertyName { get; protected set; }
        public IAnnotationProperty RangeValidated  { get; protected set; }

        public Validation() : base("Validation")
        {
            Restriction = new AnnotationProperty(
                this,
                "Restriction");
            SubPropertyName = new AnnotationProperty(
                this,
                "SubPropertyName");
            RangeValidated = new AnnotationProperty(
                this,
                "RangeValidated");
        }
    }

    public class Roles: Ontology.Ontology
    {
        public IClass Role { get; protected set; }

        public Roles(
            CommonDomainObjects commonDomainObjects
            ) : base(
                "Roles",
                commonDomainObjects)
        {
            Role = this.DeclareClass<Role>();
            Role.SubClassOf(commonDomainObjects.Named);
        }
    }

    public class Organisations: Ontology.Ontology
    {
        public IClass Organisation { get; protected set; }

        public Organisations(
            CommonDomainObjects commonDomainObjects
            ) : base(
                "Organisations",
                commonDomainObjects)
        {
            Organisation = this.DeclareClass<Organisation>();
            Organisation.SubClassOf(commonDomainObjects.Named);
        }
    }

    public class LegalEntities: Ontology.Ontology
    {
        public IClass LegalEntity { get; protected set; }

        public LegalEntities(
            Organisations organisations
            ) : base(
                "LegalEntities",
                organisations)
        {
            LegalEntity = this.DeclareClass<LegalEntity>();
            LegalEntity.SubClassOf(organisations.Organisation);
        }
    }

    public class Parties: Ontology.Ontology
    {
        public IClass                    PartyInRole  { get; protected set; }
        public IObjectPropertyExpression Role         { get; protected set; }
        public IObjectPropertyExpression Organisation { get; protected set; }
        public IObjectPropertyExpression Person       { get; protected set; }

        public Parties(
            CommonDomainObjects commonDomainObjects
            ) : base(
                "Parties",
                commonDomainObjects)
        {
            PartyInRole = this.DeclareClass<PartyInRole>();
            PartyInRole.SubClassOf(commonDomainObjects.DomainObject);
            Role         = PartyInRole.DeclareObjectProperty<PartyInRole, Role        >(partyInRole => partyInRole.Role        );
            Organisation = PartyInRole.DeclareObjectProperty<PartyInRole, Organisation>(partyInRole => partyInRole.Organisation);
            Person       = PartyInRole.DeclareObjectProperty<PartyInRole, Person      >(partyInRole => partyInRole.Person      );
        }
    }

    public class RoleIndividuals: Ontology.Ontology
    {
        public readonly INamedIndividual Sponsor;
        public readonly INamedIndividual Borrower;
        public readonly INamedIndividual Lender;
        public readonly INamedIndividual Advisor;

        public RoleIndividuals(
            CommonDomainObjects commonDomainObjects,
            Roles               roles
            ) : base(
                "RoleIndividuals",
                commonDomainObjects,
                roles)
        {
            var role = roles.Role;
            var id = commonDomainObjects.Id;
            Sponsor  = role.DeclareNamedIndividual("Sponsor" );
            Borrower = role.DeclareNamedIndividual("Borrower");
            Lender   = role.DeclareNamedIndividual("Lender"  );
            Advisor  = role.DeclareNamedIndividual("Advisor" );
            Sponsor.Value(id, DealRoleIdentifier.Sponsor);
            Borrower.Value(id, DealRoleIdentifier.Borrower);
            Lender.Value(id, DealRoleIdentifier.Lender);
            Advisor.Value(id, DealRoleIdentifier.Advisor);
        }
    }

    public class Deals: Ontology.Ontology
    {
        public IClass                    DealType            { get; protected set; }
        public IClass                    Deal                { get; protected set; }
        public IClass                    Debt                { get; protected set; }
        public IClass                    Advisory            { get; protected set; }

        public IObjectPropertyExpression Type                { get; protected set; }
        public IObjectPropertyExpression Parties             { get; protected set; }
        public IObjectPropertyExpression Confers             { get; protected set; }
        public IObjectPropertyExpression Classifiers         { get; protected set; }
        public IObjectPropertyExpression Borrowers           { get; protected set; }
        public IObjectPropertyExpression Sponsors            { get; protected set; }
        public IObjectPropertyExpression Exclusivity         { get; protected set; }
        
        public IClass                    LenderParty         { get; protected set; }
        public IClass                    AdvisorParty        { get; protected set; }
        public IClass                    SponsorParty        { get; protected set; }
        public IClass                    BorrowerParty       { get; protected set; }
        public IClass                    MufgParty           { get; protected set; }
        public IClass                    Sponsor             { get; protected set; }
        public IDataPropertyExpression   Equity              { get; protected set; }

        public INamedIndividual          Bank                { get; protected set; }
        public IClass                    BankParty           { get; protected set; }
        public IClass                    BankLenderParty     { get; protected set; }
        public IClass                    BankAdvisorParty    { get; protected set; }
                                         
        public IClass                    KeyCounterpartyRole { get; protected set; }
        public IClass                    KeyCounterparty     { get; protected set; }

        public Deals(
            CommonDomainObjects commonDomainObjects,
            Roles               roles,
            RoleIndividuals     roleIndividuals,
            LegalEntities       legalEntities,
            Parties             parties,
            Validation          validation
            ): base(
                "Deals",
                commonDomainObjects,
                roles,
                roleIndividuals,
                legalEntities,
                parties,
                validation)
        {
            DealType    = this.DeclareClass<DealType>();
            DealType.SubClassOf(commonDomainObjects.Named);
            Deal        = this.DeclareClass<Deal>();
            Deal.SubClassOf(commonDomainObjects.Named);
            Type        = Deal.DeclareObjectProperty<Deal, DealType   >(deal => deal.Type       );
            Parties     = Deal.DeclareObjectProperty<Deal, PartyInRole>(deal => deal.Parties    );
            Classifiers = Deal.DeclareObjectProperty<Deal, Classifier >(deal => deal.Classifiers);
            Confers     = Deal.DeclareObjectProperty<Deal, Commitment >(deal => deal.Confers    );
            Borrowers   = Deal.DeclareObjectProperty<Deal, PartyInRole>(
                "Borrowers",
                deal => deal.Parties.Where(dealParty => dealParty.Role.Id == DealRoleIdentifier.Borrower));
            Sponsors    = Deal.DeclareObjectProperty<Deal, Sponsor   >(
                "Sponsors",
                deal => deal.Parties.Where(dealParty => dealParty.Role.Id == DealRoleIdentifier.Sponsor).Cast<Sponsor>());
            this.Exclusivity = Deal.DeclareObjectProperty<Deal, ExclusivityClassifier>(
                "Exclusivity",
                deal => deal.Classifiers.OfType<ExclusivityClassifier>().FirstOrDefault());

            Deal.SubClassOf(
                new DataSomeValuesFrom(
                    commonDomainObjects.Name,
                    new DataComplementOf(new DataOneOf(string.Empty))))
                .Annotate(
                    validation.Restriction,
                    0);
            Deal.SubClassOf(this.Exclusivity.ExactCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);

            LenderParty   = this.DeclareClass("LenderParty"  );
            AdvisorParty  = this.DeclareClass("AdvisorParty" );
            BorrowerParty = this.DeclareClass("BorrowerParty");
            SponsorParty  = this.DeclareClass("SponsorParty" );

            LenderParty.SubClassOf(parties.PartyInRole);
            AdvisorParty.SubClassOf(parties.PartyInRole);
            BorrowerParty.SubClassOf(parties.PartyInRole);
            SponsorParty.SubClassOf(parties.PartyInRole);
            
            LenderParty.Define(parties.Role.HasValue(roleIndividuals.Lender));
            AdvisorParty.Define(parties.Role.HasValue(roleIndividuals.Advisor));
            BorrowerParty.Define(parties.Role.HasValue(roleIndividuals.Borrower));
            SponsorParty.Define(parties.Role.HasValue(roleIndividuals.Sponsor));;

            Sponsor = this.DeclareClass<Sponsor>();
            Sponsor.SubClassOf(SponsorParty);
            Equity = Sponsor.DeclareDataProperty<Sponsor, decimal?>(sponsor => sponsor.Equity);
            Sponsor
                .SubClassOf(Equity.ExactCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);

            Bank             = legalEntities.LegalEntity.DeclareNamedIndividual("Bank");
            BankParty        = this.DeclareClass("BankParty");
            BankLenderParty  = this.DeclareClass("BankLenderParty");
            BankAdvisorParty = this.DeclareClass("BankAdvisorParty");
            BankParty.Define(parties.Organisation.HasValue(Bank));
            BankLenderParty.Define(LenderParty.Intersect(BankParty));
            BankAdvisorParty.Define(AdvisorParty.Intersect(BankParty));

            BankParty.SubClassOf(parties.PartyInRole);

            KeyCounterpartyRole = this.DeclareClass("KeyCounterpartyRole");
            KeyCounterparty     = this.DeclareClass("KeyCounterparty");
            KeyCounterparty.SubClassOf(parties.PartyInRole);
            KeyCounterparty.Define(new ObjectSomeValuesFrom(parties.Role, KeyCounterpartyRole));

            Debt = this.DeclareClass("Debt");
            Debt.SubClassOf(Deal);
            Debt.SubClassOf(Parties.ExactCardinality(1, BankLenderParty));
            Debt.SubClassOf(Borrowers.MinCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);

            new DisjointClasses(
                this,
                Deal,
                DealType,
                parties.PartyInRole,
                commonDomainObjects.Classifier);

            var ExclusivityClassifier = this.DeclareClass<ExclusivityClassifier>();
            ExclusivityClassifier.SubClassOf(commonDomainObjects.Classifier);
            Deal.SubClassOf(Classifiers.ExactCardinality(1, ExclusivityClassifier))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Exclusivity");

            var NotExclusive = ExclusivityClassifier.DeclareNamedIndividual("NotExclusive");
            NotExclusive.Value(commonDomainObjects.Id, ExclusivityClassifierIdentifier.No);
            var Exclusive = ExclusivityClassifier.Intersect(new ObjectOneOf(NotExclusive).Complement());

            var ExclusiveDeal = this.DeclareClass("ExclusiveDeal");
            ExclusiveDeal.SubClassOf(Deal);
            var intermediate = this.DeclareClass("Intermediate");
            intermediate.Define(new ObjectSomeValuesFrom(Classifiers, Exclusive));
            ExclusiveDeal.Define(new ObjectIntersectionOf(intermediate));

            var Exclusivity = this.DeclareClass<Exclusivity>();
            var Date = Exclusivity.DeclareDataProperty<Exclusivity, DateTime?>(exclusivity => exclusivity.Date);
            Date.Range(ReservedVocabulary.DateTime)
                .Annotate(
                    validation.RangeValidated,
                    null);
        }
    }

    public interface IDealOntology: IOntology
    {
        IClass Deal { get; }
    }

    public class Advisory:
        Ontology.Ontology,
        IDealOntology
    {
        public IClass Deal { get; protected set; }

        public Advisory(
            CommonDomainObjects commonDomainObjects,
            Validation          validation,
            Deals               deals
            ) : base(
                "Advisory",
                commonDomainObjects,
                validation,
                deals)
        {
            var dealType = deals.DealType.DeclareNamedIndividual("Advisory");
            dealType.Value(
                commonDomainObjects.Id,
                DealTypeIdentifier.Advisory);

            Deal = this.DeclareClass("Deal");
            Deal.SubClassOf(deals.Deal);
            Deal.SubClassOf(deals.Parties.ExactCardinality(1, deals.BankAdvisorParty));
            Deal.SubClassOf(deals.Sponsors.MaxCardinality(0))
                .Annotate(
                    validation.Restriction,
                    0);
        }
    }

    public class ProjectFinance:
        Ontology.Ontology,
        IDealOntology
    {
        public IClass Deal { get; protected set; }

        public ProjectFinance(
            CommonDomainObjects commonDomainObjects,
            Deals               deals,
            Validation          validation
            ): base(
                "ProjectFinance",
                commonDomainObjects,
                deals,
                validation)
        {
            var dealType = deals.DealType.DeclareNamedIndividual("ProjectFinance");
            dealType.Value(
                commonDomainObjects.Id,
                DealTypeIdentifier.ProjectFinance);

            Deal = this.DeclareClass("Deal");
            Deal.SubClassOf(deals.Debt);
            Deal.SubClassOf(deals.Type.HasValue(dealType));
            Deal.SubClassOf(deals.Sponsors.MinCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);
        }
    }

    public static class ClassificationsExtensions
    {
        public static IDictionary<object, ILookup<IPropertyExpression, ISubClassOf>> Validate(
            this IOntology                    ontology,
            IDictionary<object, ISet<IClass>> classifications
            )
        {
            var evaluator = new ClassMembershipEvaluator(
                ontology,
                classifications);

            return (
                from keyValuePair in classifications
                let individual = keyValuePair.Key
                from classExpression in keyValuePair.Value
                from subClassOf in ontology.Get<ISubClassOf>()
                from annotation in subClassOf.Annotations
                where
                    subClassOf.SubClassExpression == classExpression &&
                    subClassOf.SuperClassExpression is IPropertyRestriction &&
                    annotation.Property.Iri == "Validation.Restriction" &&
                    !subClassOf.SuperClassExpression.Evaluate(
                        evaluator,
                        individual)
                group subClassOf by individual into errorsGroupedByIndividual
                select errorsGroupedByIndividual
            ).ToDictionary(
                group => group.Key,
                group => group.ToLookup(
                    g => ((IPropertyRestriction)g.SuperClassExpression).PropertyExpression));
        }
    }
}
