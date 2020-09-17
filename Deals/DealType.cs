using CommonDomainObjects;
using LegalEntities;
using Organisations;
using Ontology;
using Roles;
using System;
using System.Collections.Generic;
using System.Linq;

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

        private static CommonDomainObjects _instance;

        private CommonDomainObjects()
        {
            DomainObject = this.Class<DomainObject<Guid>>();
            Id = DomainObject.DataProperty<DomainObject<Guid>, Guid>(domainObject => domainObject.Id);
            DomainObject.HasKey(Id);

            Named = this.Class<Named<Guid>>();
            Name = Named.DataProperty<Named<Guid>, string>(named => named.Name);
            Named.SubClassOf(DomainObject);
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

    public class DealOntology: Ontology.Ontology
    {
        public IList<Role>      KeyCounterpartyRoles { get; protected set; } = new List<Role>();
        public INamedIndividual Mufg                 { get; protected set; }

        public DealOntology(): base(
            CommonDomainObjects.Instance,
            Roles.Instance,
            RoleIndividuals.Instance,
            Validation.Instance)
        {
            var commonDomainObjects = CommonDomainObjects.Instance;
            var roles               = Roles.Instance;
            var roleIndividuals     = RoleIndividuals.Instance;
            var validation          = Validation.Instance;

            var Organisation          = this.Class<Organisation>();
            var LegalEntity           = this.Class<LegalEntity>();
            Mufg                      = LegalEntity.NamedIndividual("MUFG");

            var Deal                  = this.Class<Deal>();
            var _Parties              = Deal.ObjectProperty<Deal, DealParty >(deal => deal.Parties    );
            var _Classifiers          = Deal.ObjectProperty<Deal, Classifier>(deal => deal.Classifiers);
            var _Commitments          = Deal.ObjectProperty<Deal, Commitment>(deal => deal.Commitments);
            Deal.SubClassOf(commonDomainObjects.Named);

            var DealParty             = this.Class<DealParty>();
            var _Role                 = DealParty.ObjectProperty<DealParty, Role>(dealParty => dealParty.Role);
            var LenderParty           = _Role.HasValue(roleIndividuals.Lender);
            var AdvisorParty          = _Role.HasValue(roleIndividuals.Advisor);
            var SponsorParty          = _Role.HasValue(roleIndividuals.Sponsor);
            var BorrowerParty         = _Role.HasValue(roleIndividuals.Borrower);
            var _Organisation         = DealParty.ObjectProperty<DealParty, Organisation>(dealParty => dealParty.Organisation);
            var MufgParty             = _Organisation.HasValue(Mufg);

            var Sponsor               = this.Class<Sponsor>();
            Sponsor.SubClassOf(SponsorParty);
            var _Equity               = Sponsor.DataProperty<Sponsor, decimal?>(sponsor => sponsor.Equity);

            var KeyCounterpartyRole   = new ObjectOneOf(this, KeyCounterpartyRoles);
            var MufgLenderParty       = new ObjectIntersectionOf(LenderParty, MufgParty);
            var MufgAdvisorParty      = new ObjectIntersectionOf(AdvisorParty, MufgParty);
            var KeyCounterpartyParty  = new ObjectSomeValuesFrom(_Role, KeyCounterpartyRole);

            Deal.SubClassOf(
                new DataSomeValuesFrom(
                    commonDomainObjects.Name,
                    new DataComplementOf(new DataOneOf(string.Empty))))
                .Annotate(
                    validation.Restriction,
                    0);
            var Debt = this.Class("Debt");
            Debt.SubClassOf(Deal);
            Debt.SubClassOf(_Parties.ExactCardinality(1, MufgLenderParty));
            Debt.SubClassOf(_Parties.MinCardinality(1, BorrowerParty))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Borrowers");

            var Advisory = this.Class("Advisory");
            Advisory.SubClassOf(Deal);
            Advisory.SubClassOf(_Parties.ExactCardinality(1, MufgAdvisorParty));
            Advisory.SubClassOf(_Parties.MaxCardinality(0, SponsorParty))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Sponsors");

            var ProjectFinance = this.Class("ProjectFinance");
            ProjectFinance.SubClassOf(Debt);
            ProjectFinance
                .SubClassOf(_Parties.MinCardinality(1, SponsorParty))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Sponsors");

            var Classifier = this.Class<Classifier>();
            Classifier.SubClassOf(commonDomainObjects.Named);
            var ExclusivityClassifier = this.Class<ExclusivityClassifier>();
            ExclusivityClassifier.SubClassOf(Classifier);
            Deal.SubClassOf(_Classifiers.ExactCardinality(1, ExclusivityClassifier))
                .Annotate(
                    validation.Restriction,
                    0)
                .Annotate(
                    validation.SubPropertyName,
                    "Exclusivity");

            var NotExclusive = ExclusivityClassifier.NamedIndividual("NotExclusive");
            NotExclusive.Value(commonDomainObjects.Id, ExclusivityClassifierIdentifier.No);
            var Exclusive = new ObjectIntersectionOf(ExclusivityClassifier, new ObjectComplementOf(new ObjectOneOf(this, NotExclusive)));

            var ExclusiveDeal = this.Class("ExclusiveDeal");
            ExclusiveDeal.Define(new ObjectSomeValuesFrom(_Classifiers, Exclusive));

            Sponsor
                .SubClassOf(_Equity.ExactCardinality(1))
                .Annotate(
                    validation.Restriction,
                    0);

            var Exclusivity = this.Class<Exclusivity>();
            var _date = Exclusivity.DataProperty<Exclusivity, DateTime?>(exclusivity => exclusivity.Date);
            _date.Range(DateTime)
                .Annotate(
                    validation.RangeValidated,
                    null);
        }
    }
}
