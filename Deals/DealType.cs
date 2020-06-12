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
        public Role                LenderRole           { get; protected set; }
        public Role                AdvisorRole          { get; protected set; }
        public INamedIndividual    SponsorRole          { get; protected set; }
        public IList<Role>         KeyCounterpartyRoles { get; protected set; } = new List<Role>();
        public LegalEntity         Mufg                 { get; protected set; }
        public IAnnotationProperty Mandatory            { get; protected set; }
        public IAnnotationProperty SubPropertyName      { get; protected set; }


        public IDataPropertyExpression Id { get; protected set; }

        // Abstract Syntax does not support annotation of SubClass Axioms.
        // Functional Syntax does not support Class Axioms with nested descriptions.

        public DealOntology()
        {
            SponsorRole      = this.NamedIndividual("Sponsor");
            var DomainObject = this.Class("DomainObject");
            var Named        = this.Class("Named");
            var Role         = this.DomainObjectClass<Role>();
            var Organisation = this.Class("Organisation");
            var LegalEntity  = this.Class("LegalEntity");
            var DealParty    = this.Class("DealParty");
            var Deal         = this.Class("Deal");
            var DomainObjectId = DomainObject.DataProperty<DomainObject<Guid>, Guid>(domainObject => domainObject.Id);
            var NamedName      = Named.DataProperty<Named<Guid>, string>(named => named.Name);
            var DealParties    = Deal.ObjectProperty<Deal, DealParty>(DealParty, deal => deal.Parties);

            Id = DomainObjectId;
            DomainObject.HasKey(DomainObjectId);
            Named.SubClassOf(DomainObject);
            Role.SubClassOf(Named);
            Deal.SubClassOf(Named);

            SponsorRole.Assert(Role);
            SponsorRole.Assert(DomainObjectId, DealRoleIdentifier.Sponsor);

            var DealPartyRole         = DealParty.ObjectProperty<DealParty, Role>(Role, dealParty => dealParty.Role);
            var DealPartyOrganisation = DealParty.ObjectProperty<DealParty, Organisation>(Organisation, dealParty => dealParty.Organisation);
            var KeyCounterpartyRole   = new ObjectOneOf(this, KeyCounterpartyRoles);
            var LenderParty           = new ObjectHasValue(DealPartyRole, LenderRole );
            var AdvisorParty          = new ObjectHasValue(DealPartyRole, AdvisorRole);
            var SponsorParty          = new ObjectHasValue(DealPartyRole, SponsorRole);
            var MufgParty             = new ObjectHasValue(DealPartyOrganisation, Mufg);
            var MufgLenderParty       = new ObjectIntersectionOf(LenderParty, MufgParty);
            var MufgAdvisorParty      = new ObjectIntersectionOf(AdvisorParty, MufgParty);
            var KeyCounterpartyParty  = new ObjectSomeValuesFrom(DealPartyRole, KeyCounterpartyRole);

            Mandatory = new AnnotationProperty(
                this,
                "Mandatory");
            SubPropertyName = new AnnotationProperty(
                this,
                "SubPropertyName");

            Deal.SubClassOf(
                new DataSomeValuesFrom(
                    NamedName,
                    new DataComplementOf(new DataOneOf(string.Empty))))
                .Annotate(
                    Mandatory,
                    0);
            var Debt = this.Class("Debt");
            Debt.SubClassOf(
                DealParties.ExactCardinality(
                    1,
                    MufgLenderParty));
            var Advisory = this.Class("Advisory");
            Advisory.SubClassOf(
                DealParties.ExactCardinality(
                    1,
                    MufgAdvisorParty));

            Debt.SubClassOf(Deal);
            Advisory.SubClassOf(Deal);

            var SponsorsCardinality = DealParties.MinCardinality(
                1,
                SponsorParty);

            var DealClassName = Deal.DataProperty<Deal, string>(deal => deal.ClassName);

            var ProjectFinance = this.DomainObjectClass("ProjectFinance");
            ProjectFinance.SubClassOf(Debt);
            ProjectFinance
                .SubClassOf(SponsorsCardinality)
                .Annotate(
                    Mandatory,
                    0)
                .Annotate(
                    SubPropertyName,
                    "Sponsors"); ;

            var Sponsor = this.DomainObjectClass<Sponsor>();
            Sponsor.SubClassOf(SponsorParty);
            var SponsorEquity = Sponsor.DataProperty<Sponsor, decimal?>(sponsor => sponsor.Equity);
            Sponsor
                .SubClassOf(SponsorEquity.ExactCardinality(1))
                .Annotate(
                    Mandatory,
                    0);
        }
    }
}
