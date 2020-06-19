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
        //public virtual IDictionary<Type, Class<Type>> Classes { get; protected set; }

        protected DealType() : base()
        {
        }
    }

    //public class ActiveFromStage<T>: ClassAxiom<T>
    //{
    //    private int _stageIndex;

    //    public ActiveFromStage(
    //        ClassExpression<T> decorated,
    //        int                stageIndex
    //        ): base(decorated)
    //    {
    //        _stageIndex = stageIndex;
    //    }

    //    public override bool HasMember(
    //        T      t,
    //        object context
    //        )
    //    {
    //        var stageIndex = (int)context;

    //        return stageIndex < _stageIndex || _decorated.HasMember(t, context);
    //    }
    //}

    //public static class ClassExpressionExtensions
    //{
    //    public static ClassExpression<T> ActiveFromStage<T>(
    //        this ClassExpression<T> classExpression,
    //        int                     stageIndex
    //        )
    //    {
    //        return classExpression;
    //    }
    //}

    public static class LegalEntityIdentifier
    {
        public static readonly Guid Mufg = Guid.Empty;
    }

    public class DealOntology: Ontology.Ontology
    {
        public Role                AdvisorRole          { get; protected set; }
        public IList<Role>         KeyCounterpartyRoles { get; protected set; } = new List<Role>();
        public INamedIndividual    Mufg                 { get; protected set; }
        public IAnnotationProperty Restriction          { get; protected set; }
        public IAnnotationProperty SubPropertyName      { get; protected set; }


        //public IDataPropertyExpression Id { get; protected set; }

        // Abstract Syntax does not support annotation of SubClass Axioms.
        // Functional Syntax does not support Class Axioms with nested descriptions.

        public DealOntology()
        {
            var DomainObject          = this.Class("DomainObject");
            var _Id                   = DomainObject.DataProperty<DomainObject<Guid>, Guid>(domainObject => domainObject.Id);
            DomainObject.HasKey(_Id);

            var Named                 = this.Class("Named");
            var _Name                 = Named.DataProperty<Named<Guid>, string>(named => named.Name);
            Named.SubClassOf(DomainObject);

            var ClassificationScheme  = this.DomainObjectClass<ClassificationScheme>();
            ClassificationScheme.SubClassOf(DomainObject);
            var Exclusivity = ClassificationScheme.NamedIndividual("Exclusivity");
            Exclusivity.Value(_Id, ClassificationSchemeIdentifier.Exclusivity);

            var Role                  = this.DomainObjectClass<Role>();
            Role.SubClassOf(Named);
            var SponsorRole = Role.NamedIndividual("Sponsor");
            SponsorRole.Value(_Id, DealRoleIdentifier.Sponsor);
            var BorrowerRole = Role.NamedIndividual("Borrower");
            BorrowerRole.Value(_Id, DealRoleIdentifier.Borrower);
            var LenderRole = Role.NamedIndividual("Lender");
            LenderRole.Value(_Id, DealRoleIdentifier.Lender);

            var Organisation          = this.DomainObjectClass<Organisation>();
            var LegalEntity           = this.DomainObjectClass<LegalEntity>();
            Mufg                      = LegalEntity.NamedIndividual("MUFG");

            var Deal                  = this.Class("Deal");
            var _Parties              = Deal.ObjectProperty<Deal, DealParty>(deal => deal.Parties);
            var _Classes              = Deal.ObjectProperty<Deal, DealClass>(deal => deal.Classes);
            Deal.SubClassOf(Named);

            var DealParty             = this.DomainObjectClass<DealParty>();
            var _Role                 = DealParty.ObjectProperty<DealParty, Role>(dealParty => dealParty.Role);
            var LenderParty           = _Role.HasValue(LenderRole);
            var AdvisorParty          = _Role.HasValue(AdvisorRole);
            var SponsorParty          = _Role.HasValue(SponsorRole);
            var BorrrowerParty        = _Role.HasValue(BorrowerRole);
            var _Organisation         = DealParty.ObjectProperty<DealParty, Organisation>(dealParty => dealParty.Organisation);
            var MufgParty             = _Organisation.HasValue(Mufg);

            var Sponsor               = this.DomainObjectClass<Sponsor>();
            Sponsor.SubClassOf(SponsorParty);
            var _Equity               = Sponsor.DataProperty<Sponsor, decimal?>(sponsor => sponsor.Equity);

            var DealClass             = this.DomainObjectClass<DealClass>();
            var _ClassificationScheme = DealClass.ObjectProperty<DealClass, ClassificationScheme>(dealClass => dealClass.ClassificationScheme);

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

            var ProjectFinance = this.DomainObjectClass("ProjectFinance");
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

            ProjectFinance
                .SubClassOf(_Classes.ExactCardinality(1, _ClassificationScheme.HasValue(Exclusivity)))
                .Annotate(
                    Restriction,
                    0)
                .Annotate(
                    SubPropertyName,
                    "Exclusivity");
            Sponsor
                .SubClassOf(_Equity.ExactCardinality(1))
                .Annotate(
                    Restriction,
                    0);
        }
    }
}
