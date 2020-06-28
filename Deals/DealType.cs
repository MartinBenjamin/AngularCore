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

    public class DealOntology: Ontology.Ontology
    {
        public IList<Role>         KeyCounterpartyRoles { get; protected set; } = new List<Role>();
        public INamedIndividual    Mufg                 { get; protected set; }
        public IAnnotationProperty Restriction          { get; protected set; }
        public IAnnotationProperty SubPropertyName      { get; protected set; }

        public DealOntology()
        {
            var DomainObject          = this.Class<DomainObject<Guid>>();
            var _Id                   = DomainObject.DataProperty<DomainObject<Guid>, Guid>(domainObject => domainObject.Id);
            DomainObject.HasKey(_Id);

            var Named                 = this.Class<Named<Guid>>();
            var _Name                 = Named.DataProperty<Named<Guid>, string>(named => named.Name);
            Named.SubClassOf(DomainObject);

            var ClassificationScheme  = this.Class<ClassificationScheme>();
            ClassificationScheme.SubClassOf(DomainObject);
            var Exclusivity = ClassificationScheme.NamedIndividual("Exclusivity");
            Exclusivity.Value(_Id, ClassificationSchemeIdentifier.Exclusivity);

            var Role                  = this.Class<Role>();
            Role.SubClassOf(Named);
            var SponsorRole = Role.NamedIndividual("Sponsor");
            SponsorRole.Value(_Id, DealRoleIdentifier.Sponsor);
            var BorrowerRole = Role.NamedIndividual("Borrower");
            BorrowerRole.Value(_Id, DealRoleIdentifier.Borrower);
            var LenderRole = Role.NamedIndividual("Lender");
            LenderRole.Value(_Id, DealRoleIdentifier.Lender);
            var AdvisorRole = Role.NamedIndividual("Advisor");
            LenderRole.Value(_Id, DealRoleIdentifier.Advisor);

            var Organisation          = this.Class<Organisation>();
            var LegalEntity           = this.Class<LegalEntity>();
            Mufg                      = LegalEntity.NamedIndividual("MUFG");

            var Deal                  = this.Class<Deal>();
            var _Parties              = Deal.ObjectProperty<Deal, DealParty>(deal => deal.Parties);
            var _Classes              = Deal.ObjectProperty<Deal, Classifier>(deal => deal.Classifiers);
            Deal.SubClassOf(Named);

            var DealParty             = this.Class<DealParty>();
            var _Role                 = DealParty.ObjectProperty<DealParty, Role>(dealParty => dealParty.Role);
            var LenderParty           = _Role.HasValue(LenderRole);
            var AdvisorParty          = _Role.HasValue(AdvisorRole);
            var SponsorParty          = _Role.HasValue(SponsorRole);
            var BorrrowerParty        = _Role.HasValue(BorrowerRole);
            var _Organisation         = DealParty.ObjectProperty<DealParty, Organisation>(dealParty => dealParty.Organisation);
            var MufgParty             = _Organisation.HasValue(Mufg);

            var Sponsor               = this.Class<Sponsor>();
            Sponsor.SubClassOf(SponsorParty);
            var _Equity               = Sponsor.DataProperty<Sponsor, decimal?>(sponsor => sponsor.Equity);

            var DealClass             = this.Class<DealClassifier>();

            var KeyCounterpartyRole   = new ObjectOneOf(this, KeyCounterpartyRoles);
            var MufgLenderParty       = new ObjectIntersectionOf(LenderParty, MufgParty);
            var MufgAdvisorParty      = new ObjectIntersectionOf(AdvisorParty, MufgParty);
            var KeyCounterpartyParty  = new ObjectSomeValuesFrom(_Role, KeyCounterpartyRole);

            Restriction = new AnnotationProperty(
                this,
                "Restriction");
            SubPropertyName = new AnnotationProperty(
                this,
                "SubPropertyName");

            Deal.SubClassOf(
                new DataSomeValuesFrom(
                    _Name,
                    new DataComplementOf(new DataOneOf(string.Empty))))
                .Annotate(
                    Restriction,
                    0);
            var Debt = this.Class("Debt");
            Debt.SubClassOf(_Parties.ExactCardinality(1, MufgLenderParty));
            Debt.SubClassOf(Deal);

            var Advisory = this.Class("Advisory");
            Advisory.SubClassOf(_Parties.ExactCardinality(1, MufgAdvisorParty));
            Advisory.SubClassOf(Deal);

            var ProjectFinance = this.Class("ProjectFinance");
            ProjectFinance.SubClassOf(Debt);
            ProjectFinance
                .SubClassOf(_Parties.MinCardinality(1, SponsorParty))
                .Annotate(
                    Restriction,
                    0)
                .Annotate(
                    SubPropertyName,
                    "Sponsors");

            ProjectFinance
                .SubClassOf(_Parties.MinCardinality(1, BorrrowerParty))
                .Annotate(
                    Restriction,
                    0)
                .Annotate(
                    SubPropertyName,
                    "Borrowers");

            //ProjectFinance
            //    .SubClassOf(_Classes.ExactCardinality(1, _ClassificationScheme.HasValue(Exclusivity)))
            //    .Annotate(
            //        Restriction,
            //        0)
            //    .Annotate(
            //        SubPropertyName,
            //        "Exclusivity");
            Sponsor
                .SubClassOf(_Equity.ExactCardinality(1))
                .Annotate(
                    Restriction,
                    0);
        }
    }
}
