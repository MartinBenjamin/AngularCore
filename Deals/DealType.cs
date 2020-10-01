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

namespace Deals
{
    public class DealType: Named<Guid>
    {
        public virtual IList<Role>  KeyCounterparties { get; protected set; }
        //public virtual IList<Stage> Stages            { get; protected set; }

        protected DealType() : base()
        {
        }
    }

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
            DomainObject = this.Class<DomainObject<Guid>>();
            Id = DomainObject.DataProperty<DomainObject<Guid>, Guid>(domainObject => domainObject.Id);
            DomainObject.HasKey(Id);

            Named = this.Class<Named<Guid>>();
            Named.SubClassOf(DomainObject);
            Name = Named.DataProperty<Named<Guid>, string>(named => named.Name);

            Classifier = this.Class<Classifier>();
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
            Role = this.Class<Role>();
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
            Organisation = this.Class<Organisation>();
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
            LegalEntity = this.Class<LegalEntity>();
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
            PartyInRole = this.Class<PartyInRole>();
            PartyInRole.SubClassOf(commonDomainObjects.DomainObject);
            Role         = PartyInRole.ObjectProperty<PartyInRole, Role        >(partyInRole => partyInRole.Role        );
            Organisation = PartyInRole.ObjectProperty<PartyInRole, Organisation>(partyInRole => partyInRole.Organisation);
            Person       = PartyInRole.ObjectProperty<PartyInRole, Person      >(partyInRole => partyInRole.Person      );
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
            Sponsor  = role.NamedIndividual("Sponsor" );
            Borrower = role.NamedIndividual("Borrower");
            Lender   = role.NamedIndividual("Lender"  );
            Advisor  = role.NamedIndividual("Advisor" );
            Sponsor.Value(id, DealRoleIdentifier.Sponsor);
            Borrower.Value(id, DealRoleIdentifier.Borrower);
            Lender.Value(id, DealRoleIdentifier.Lender);
            Advisor.Value(id, DealRoleIdentifier.Advisor);
        }
    }

    public class Deals: Ontology.Ontology
    {
        public IClass                    Deal                { get; protected set; }
        public IClass                    Debt                { get; protected set; }
        public IClass                    Advisory            { get; protected set; }

        public IObjectPropertyExpression Parties             { get; protected set; }
        public IObjectPropertyExpression Commitments         { get; protected set; }
        public IObjectPropertyExpression Classifiers         { get; protected set; }
        public IObjectPropertyExpression Borrowers           { get; protected set; }
        public IObjectPropertyExpression Sponsors            { get; protected set; }
        public IObjectPropertyExpression Exclusivity         { get; protected set; }
        
        public IClass                    DealParty           { get; protected set; }
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
                parties,
                validation)
        {
            var Deal        = this.Class<Deal>();
            Deal.SubClassOf(commonDomainObjects.Named);
            Parties     = Deal.ObjectProperty<Deal, DealParty >(deal => deal.Parties    );
            Classifiers = Deal.ObjectProperty<Deal, Classifier>(deal => deal.Classifiers);
            Commitments = Deal.ObjectProperty<Deal, Commitment>(deal => deal.Commitments);
            Borrowers   = Deal.ObjectProperty<Deal, DealParty >(
                "Borrowers",
                deal => deal.Parties.Where(dealParty => dealParty.Role.Id == DealRoleIdentifier.Borrower));
            Sponsors    = Deal.ObjectProperty<Deal, Sponsor   >(
                "Sponsors",
                deal => deal.Parties.Where(dealParty => dealParty.Role.Id == DealRoleIdentifier.Sponsor).Cast<Sponsor>());
            this.Exclusivity = Deal.ObjectProperty<Deal, ExclusivityClassifier>(
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

            DealParty = this.Class<DealParty>();
            DealParty.SubClassOf(parties.PartyInRole);
            LenderParty   = this.Class("LenderParty"  );
            AdvisorParty  = this.Class("AdvisorParty" );
            BorrowerParty = this.Class("BorrowerParty");
            SponsorParty  = this.Class("SponsorParty" );
            
            LenderParty.Define(parties.Role.HasValue(roleIndividuals.Lender));
            AdvisorParty.Define(parties.Role.HasValue(roleIndividuals.Advisor));
            BorrowerParty.Define(parties.Role.HasValue(roleIndividuals.Borrower));
            SponsorParty.Define(parties.Role.HasValue(roleIndividuals.Sponsor));;

            Sponsor = this.Class<Sponsor>();
            Sponsor.SubClassOf(SponsorParty);
            Equity = Sponsor.DataProperty<Sponsor, decimal?>(sponsor => sponsor.Equity);
            Sponsor
                .SubClassOf(Equity.ExactCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);

            Bank             = legalEntities.LegalEntity.NamedIndividual("Bank");
            BankParty        = this.Class("BankParty");
            BankLenderParty  = this.Class("BankLenderParty");
            BankAdvisorParty = this.Class("BankAdvisorParty");
            BankParty.Define(parties.Organisation.HasValue(Bank));
            BankLenderParty.Define(LenderParty.Intersect(BankParty));
            BankAdvisorParty.Define(AdvisorParty.Intersect(BankParty));

            KeyCounterpartyRole = this.Class("KeyCounterpartyRole");
            KeyCounterparty     = this.Class("KeyCounterparty");
            KeyCounterparty.Define(new ObjectSomeValuesFrom(parties.Role, KeyCounterpartyRole));

            Debt = this.Class("Debt");
            Debt.SubClassOf(Deal);
            Debt.SubClassOf(Parties.ExactCardinality(1, BankLenderParty));
            Debt.SubClassOf(Borrowers.MinCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);

            var ExclusivityClassifier = this.Class<ExclusivityClassifier>();
            ExclusivityClassifier.SubClassOf(commonDomainObjects.Classifier);
            Deal.SubClassOf(Classifiers.ExactCardinality(1, ExclusivityClassifier))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Exclusivity");

            var NotExclusive = ExclusivityClassifier.NamedIndividual("NotExclusive");
            NotExclusive.Value(commonDomainObjects.Id, ExclusivityClassifierIdentifier.No);
            var Exclusive = ExclusivityClassifier.Intersect(new ObjectOneOf(NotExclusive).Complement());

            var ExclusiveDeal = this.Class("ExclusiveDeal");
            var intermediate = this.Class("Intermediate");
            intermediate.Define(new ObjectSomeValuesFrom(Classifiers, Exclusive));
            ExclusiveDeal.Define(new ObjectIntersectionOf(intermediate));

            var Exclusivity = this.Class<Exclusivity>();
            var Date = Exclusivity.DataProperty<Exclusivity, DateTime?>(exclusivity => exclusivity.Date);
            Date.Range(DateTime)
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
            Deals      deals,
            Validation validation
            ) : base(
                "Advisory",
                deals,
                validation)
        {
            Deal = this.Class("Deal");
            Deal.SubClassOf(Deal);
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
            Deals      deals,
            Validation validation
            ): base(
                "ProjectFinance",
                deals,
                validation)
        {
            Deal = this.Class("Deal");
            Deal.SubClassOf(deals.Debt);
            Deal.SubClassOf(deals.Sponsors.MinCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);
        }
    }

    public static class ClassificationsExtensions
    {
        public static IDictionary<object, ILookup<IPropertyExpression, ISubClassOf>> Validate(
            this IOntology                                 ontology,
            IDictionary<object, HashSet<IClassExpression>> classifications
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
