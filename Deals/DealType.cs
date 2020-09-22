﻿using CommonDomainObjects;
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
        public readonly IClass                  DomainObject;
        public readonly IDataPropertyExpression Id;
        public readonly IClass                  Named;
        public readonly IDataPropertyExpression Name;
        public readonly IClass                  Classifier;

        private static CommonDomainObjects _instance;

        private CommonDomainObjects()
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

        public static CommonDomainObjects Instance
        {
            get
            {
                if(_instance == null)
                    _instance = new CommonDomainObjects();

                return _instance;
            }
        }
    }

    public class Validation: Ontology.Ontology
    {
        public readonly IAnnotationProperty Restriction;
        public readonly IAnnotationProperty SubPropertyName;
        public readonly IAnnotationProperty RangeValidated;

        private static Validation _instance;

        private Validation() : base()
        {
            Restriction = new AnnotationProperty(
                this,
                "Restriction");
            SubPropertyName = new AnnotationProperty(
                this,
                "SubPropertyName");
            RangeValidated = new AnnotationProperty(
                this,
                "Validated");
        }
        public static Validation Instance
        {
            get
            {
                if(_instance == null)
                    _instance = new Validation();

                return _instance;
            }
        }
    }

    public class Roles: Ontology.Ontology
    {
        public readonly IClass Role;

        private static Roles _instance;

        private Roles() : base(CommonDomainObjects.Instance)
        {
            Role = this.Class<Role>();
            Role.SubClassOf(CommonDomainObjects.Instance.Named);
        }

        public static Roles Instance
        {
            get
            {
                if(_instance == null)
                    _instance = new Roles();

                return _instance;
            }
        }
    }

    public class Organisations: Ontology.Ontology
    {
        public readonly IClass Organisation;

        private static Organisations _instance;

        private Organisations() : base(CommonDomainObjects.Instance)
        {
            Organisation = this.Class<Organisation>();
            Organisation.SubClassOf(CommonDomainObjects.Instance.Named);
        }

        public static Organisations Instance
        {
            get
            {
                if(_instance == null)
                    _instance = new Organisations();

                return _instance;
            }
        }
    }

    public class LegalEntities: Ontology.Ontology
    {
        public readonly IClass LegalEntity;

        private static LegalEntities _instance;

        private LegalEntities() : base(Organisations.Instance)
        {
            LegalEntity = this.Class<LegalEntity>();
            LegalEntity.SubClassOf(Organisations.Instance.Organisation);
        }

        public static LegalEntities Instance
        {
            get
            {
                if(_instance == null)
                    _instance = new LegalEntities();

                return _instance;
            }
        }
    }

    public class Parties: Ontology.Ontology
    {
        public readonly IClass                    PartyInRole;
        public readonly IObjectPropertyExpression Role;
        public readonly IObjectPropertyExpression Organisation;
        public readonly IObjectPropertyExpression Person;

        private static Parties _instance;

        private Parties() : base(
            CommonDomainObjects.Instance,
            Roles.Instance)
        {
            var commonDomainObjects = CommonDomainObjects.Instance;
            PartyInRole = this.Class<PartyInRole>();
            PartyInRole.SubClassOf(commonDomainObjects.DomainObject);
            Role         = PartyInRole.ObjectProperty<PartyInRole, Role        >(partyInRole => partyInRole.Role        );
            Organisation = PartyInRole.ObjectProperty<PartyInRole, Organisation>(partyInRole => partyInRole.Organisation);
            Person       = PartyInRole.ObjectProperty<PartyInRole, Person      >(partyInRole => partyInRole.Person      );
        }

        public static Parties Instance
        {
            get
            {
                if(_instance == null)
                    _instance = new Parties();

                return _instance;
            }
        }
    }

    public class RoleIndividuals: Ontology.Ontology
    {
        public readonly INamedIndividual Sponsor;
        public readonly INamedIndividual Borrower;
        public readonly INamedIndividual Lender;
        public readonly INamedIndividual Advisor;

        private static RoleIndividuals _instance;

        private RoleIndividuals() : base(
            CommonDomainObjects.Instance,
            Roles.Instance)
        {
            var role = Roles.Instance.Role;
            var id = CommonDomainObjects.Instance.Id;
            Sponsor  = role.NamedIndividual("Sponsor");
            Borrower = role.NamedIndividual("Borrower");
            Lender   = role.NamedIndividual("Lender");
            Advisor  = role.NamedIndividual("Advisor");
            Sponsor.Value(id, DealRoleIdentifier.Sponsor);
            Borrower.Value(id, DealRoleIdentifier.Borrower);
            Lender.Value(id, DealRoleIdentifier.Lender);
            Advisor.Value(id, DealRoleIdentifier.Advisor);
        }

        public static RoleIndividuals Instance
        {
            get
            {
                if(_instance == null)
                    _instance = new RoleIndividuals();

                return _instance;
            }
        }
    }

    public class DealParties: Ontology.Ontology
    {
        public readonly IClass                  DealParty;
        public readonly IClass                  LenderParty;
        public readonly IClass                  AdvisorParty;
        public readonly IClass                  SponsorParty;
        public readonly IClass                  BorrowerParty;
        public readonly IClass                  MufgParty;
        public readonly IClass                  Sponsor;
        public readonly IDataPropertyExpression Equity;

        public readonly INamedIndividual        Bank;
        public readonly IClass                  BankParty;
        public readonly IClass                  BankLenderParty;
        public readonly IClass                  BankAdvisorParty;

        public readonly IClass                  KeyCounterpartyRole;
        public readonly IClass                  KeyCounterparty;

        private static DealParties _instance;

        private DealParties() : base(
            CommonDomainObjects.Instance,
            Roles.Instance,
            RoleIndividuals.Instance,
            Parties.Instance,
            LegalEntities.Instance,
            Validation.Instance)
        {
            var roles           = Roles.Instance;
            var roleIndividuals = RoleIndividuals.Instance;
            var parties         = Parties.Instance;

            DealParty = this.Class<DealParty>();
            DealParty.SubClassOf(parties.PartyInRole);
            LenderParty   = this.Class("LenderParty");
            AdvisorParty  = this.Class("AdvisorParty");
            BorrowerParty = this.Class("BorrowerParty");
            SponsorParty  = this.Class("SponsorParty");
            
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
                    Validation.Instance.Restriction,
                    0);

            Bank             = LegalEntities.Instance.LegalEntity.NamedIndividual("Bank");
            BankParty        = this.Class("BankParty");
            BankLenderParty  = this.Class("BankLenderParty");
            BankAdvisorParty = this.Class("BankAdvisorParty");
            BankParty.Define(parties.Organisation.HasValue(Bank));
            BankLenderParty.Define(LenderParty.Intersect(BankParty));
            BankAdvisorParty.Define(AdvisorParty.Intersect(BankParty));

            KeyCounterpartyRole = this.Class("KeyCounterpartyRole");
            KeyCounterparty     = this.Class("KeyCounterparty");
            KeyCounterparty.Define(new ObjectAllValuesFrom(parties.Role, KeyCounterpartyRole));
        }

        public static DealParties Instance
        {
            get
            {
                if(_instance == null)
                    _instance = new DealParties();

                return _instance;
            }
        }
    }

    public class DealOntology: Ontology.Ontology
    {
        public readonly IClass                    Deal;
        public readonly IObjectPropertyExpression Parties;
        public readonly IObjectPropertyExpression Commitments;
        public readonly IObjectPropertyExpression Classifiers;
        public readonly IObjectPropertyExpression Borrowers;

        public DealOntology(): base(
            CommonDomainObjects.Instance,
            Roles.Instance,
            RoleIndividuals.Instance,
            Deals.Parties.Instance,
            DealParties.Instance,
            Validation.Instance)
        {
            var commonDomainObjects = CommonDomainObjects.Instance;
            var roles               = Roles.Instance;
            var roleIndividuals     = RoleIndividuals.Instance;
            var parties             = Deals.Parties.Instance;
            var dealParties         = DealParties.Instance;
            var validation          = Validation.Instance;

            var Deal        = this.Class<Deal>();
            Deal.SubClassOf(commonDomainObjects.Named);
            Parties     = Deal.ObjectProperty<Deal, DealParty >(deal => deal.Parties    );
            Classifiers = Deal.ObjectProperty<Deal, Classifier>(deal => deal.Classifiers);
            Commitments = Deal.ObjectProperty<Deal, Commitment>(deal => deal.Commitments);
            Borrowers   = Deal.ObjectProperty<Deal, DealParty >(deal => deal.Borrowers  );

            Deal.SubClassOf(
                new DataSomeValuesFrom(
                    commonDomainObjects.Name,
                    new DataComplementOf(new DataOneOf(string.Empty))))
                .Annotate(
                    validation.Restriction,
                    0);

            var Debt = this.Class("Debt");
            Debt.SubClassOf(Deal);
            Debt.SubClassOf(Parties.ExactCardinality(1, dealParties.BankLenderParty));
            Debt.SubClassOf(Parties.MinCardinality(1, dealParties.BorrowerParty))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Borrowers");
            Debt.SubClassOf(Borrowers.MinCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);

            var Advisory = this.Class("Advisory");
            Advisory.SubClassOf(Deal);
            Advisory.SubClassOf(Parties.ExactCardinality(1, dealParties.BankAdvisorParty));
            Advisory.SubClassOf(Parties.MaxCardinality(0, dealParties.SponsorParty))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Sponsors");

            var ProjectFinance = this.Class("ProjectFinance");
            ProjectFinance.SubClassOf(Debt);
            ProjectFinance
                .SubClassOf(Parties.MinCardinality(1, dealParties.SponsorParty))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Sponsors");

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
            var Exclusive = ExclusivityClassifier.Intersect(new ObjectOneOf(this, NotExclusive).Complement());

            var ExclusiveDeal = this.Class("ExclusiveDeal");
            ExclusiveDeal.Define(new ObjectSomeValuesFrom(Classifiers, Exclusive));

            var Exclusivity = this.Class<Exclusivity>();
            var Date = Exclusivity.DataProperty<Exclusivity, DateTime?>(exclusivity => exclusivity.Date);
            Date.Range(DateTime)
                .Annotate(
                    validation.RangeValidated,
                    null);
        }
    }

    public static class ClassificationsExtensions
    {
        public static IDictionary<object, ILookup<IPropertyExpression, ISubClassOf>> Validate(
            this IOntology                                 ontology,
            IDictionary<object, HashSet<IClassExpression>> classifications
            ) => (
                from keyValuePair in classifications
                let individual = keyValuePair.Key
                from classExpression in keyValuePair.Value
                from subClassOf in ontology.Get<ISubClassOf>()
                from annotation in subClassOf.Annotations
                where
                    subClassOf.SubClassExpression == classExpression &&
                    subClassOf.SuperClassExpression is IPropertyRestriction &&
                    annotation.Property == Validation.Instance.Restriction &&
                    !subClassOf.SuperClassExpression.HasMember(
                        ontology,
                        classifications,
                        individual)
                group subClassOf by individual into errorsGroupedByIndividual
                select errorsGroupedByIndividual
            ).ToDictionary(
                group => group.Key,
                group => group.ToLookup(
                    g => ((IPropertyRestriction)g.SuperClassExpression).PropertyExpression,
                    g => g));
    }

}
