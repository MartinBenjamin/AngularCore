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
        public Role        LenderRole           { get; protected set; }
        public Role        AdvisorRole          { get; protected set; }
        public Role        SponsorRole          { get; protected set; }
        public IList<Role> KeyCounterpartyRoles { get; protected set; } = new List<Role>();
        public LegalEntity Mufg                 { get; protected set; }

        public ISubClassOf NameMandatory        { get; protected set; }
        public ISubClassOf SponsorCardinality   { get; protected set; }

        public IDataPropertyExpression Id { get; protected set; }

        public static IList<IClassExpression> Classes = new List<IClassExpression>();
        public IList<ISubClassOf> ClassAxioms { get; protected set; } = new List<ISubClassOf>();

        // Abstract Syntax does not support annotation of SubClass Axioms.
        // Functional Syntax does not support Class Axioms with nested descriptions.

        public static IClassExpression ProjectFinance;

        public DealOntology()
        {
            var DomainObject = this.Class<DomainObject<Guid>>();
            //new HasKey<DomainObject<Guid>, Guid>(DomainObject, domainObject => domainObject.Id);
            var Named        = this.Class<Named<Guid>>();
            var Role         = this.Class<Role>();
            var Organisation = this.Class<Organisation>();
            var LegalEntity  = this.Class<LegalEntity>();
            var DealParty    = this.Class<DealParty>();
            var Deal         = this.Class<Deal>();
            var DomainObjectId = DomainObject.DataProperty<DomainObject<Guid>, Guid>(domainObject => domainObject.Id);
            var NamedName      = Named.DataProperty<Named<Guid>, string>(named => named.Name);
            var DealParties    = Deal.ObjectProperty<Deal, DealParty>(DealParty, deal => deal.Parties);

            Id = DomainObjectId;
            DomainObject.HasKey(DomainObjectId);
            Role.HasKey(DomainObjectId);
            LegalEntity.HasKey(DomainObjectId);
            ClassAxioms.Add(new SubClassOf(Named, DomainObject));
            ClassAxioms.Add(new SubClassOf(Role, Named));
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

            NameMandatory = new SubClassOf(
                Deal,
                new DataSomeValuesFrom(
                    NamedName,
                    new DataComplementOf(new DataOneOf(string.Empty))));
            ClassAxioms.Add(NameMandatory);
            var Debt = DealParties.ExactCardinality(
                1,
                MufgLenderParty);
            var Advisory = DealParties.ExactCardinality(
                1,
                MufgAdvisorParty);

            ClassAxioms.Add(new SubClassOf(Debt, Deal));
            ClassAxioms.Add(new SubClassOf(Advisory, Deal));

            var SponsorsCardinality = DealParties.MinCardinality(
                1,
                SponsorParty);

            var DealClassName = Deal.DataProperty<Deal, string>(deal => deal.ClassName);

            ProjectFinance = new DataHasValue(
                DealClassName,
                "ProjectFinance");
            ClassAxioms.Add(new SubClassOf(
                ProjectFinance,
                Debt));
            ClassAxioms.Add(SponsorCardinality = new SubClassOf(
                ProjectFinance,
                SponsorsCardinality));

            var Sponsor = new Class<Sponsor>(this);
            new SubClassOf(Sponsor, SponsorParty);
            var SponsorEquity = Sponsor.DataProperty<Sponsor, decimal?>(sponsor => sponsor.Equity);

            ClassAxioms.Add(new SubClassOf(
                Sponsor,
                SponsorEquity.ExactCardinality(1)));
        }
    }

    public class SubGraph
    {
        public SubGraph                Super             { get; protected set; }
        public IList<VertexExpression> VertexExpressions { get; protected set; }

        public void Validate(
            ILookup<Type, object>                        vertexLookup,
            IDictionary<object, IList<VertexExpression>> errors
            )
        {
            (
                from @group in vertexLookup
                from vertex in @group
                from subGraph in GetSubGraphs()
                from ve in subGraph.VertexExpressions
                where @group.Key == ve.Vertex && !ve.Classifies(vertex)
                group ve by vertex into vesGroupedByVertex
                select vesGroupedByVertex
            ).ForEach(
                group =>
                {
                    if(!errors.TryGetValue(
                        group.Key,
                        out IList<VertexExpression> vertices
                        ))
                    {
                        var vertexExpressions = vertices.ToList();
                        vertexExpressions.AddRange(group);
                        errors[group.Key] = vertexExpressions;
                    }
                    else
                        errors[group.Key] = group.ToList();
                });
        }

        IEnumerable<SubGraph> GetSubGraphs()
        {
            var subGraph = this;
            while(subGraph != null)
            {
                yield return subGraph;
                subGraph = subGraph.Super;
            }
        }
    }

    public abstract class VertexExpression
    {
        public Type Vertex { get; protected set; }

        protected VertexExpression(
            Type vertex
            )
        {
            Vertex = vertex;
        }

        public abstract bool Classifies(object vertex);
    }

    public abstract class EdgeExpression: VertexExpression
    {
        public Edge Edge { get; protected set; }

        protected EdgeExpression(
            Edge edge
            ) : base(edge.Out)
        {
            Edge = edge;
        }
    }

    public abstract class DataPropertyExpression: VertexExpression
    {
        protected DataPropertyExpression(
            Type vertex
            ) : base(vertex)
        {

        }
    }

    public abstract class EdgeCardinalityExpression: EdgeExpression
    {
        public int              Cardinality      { get; protected set; }
        public VertexExpression VertexExpression { get; protected set; }

        protected EdgeCardinalityExpression(
            Edge             edge,
            int              cardinality,
            VertexExpression vertexExpression
            ) : base(edge)
        {
            Cardinality      = cardinality;
            VertexExpression = vertexExpression;
        }
    }

    public class EdgeMinCardinailityExpression: EdgeCardinalityExpression
    {
        protected EdgeMinCardinailityExpression(
            Edge             edge,
            int              cardinality,
            VertexExpression vertexExpression
            ) : base(
                edge,
                cardinality,
                vertexExpression)
        {
            VertexExpression = vertexExpression;
        }

        public override bool Classifies(
            object vertex
            ) => Edge
                .SelectIn(Vertex)
                .Where(v => VertexExpression != null ? VertexExpression.Classifies(v) : true)
                .Count() >= 0;
    }
 
    public class EdgeMaxCardinailityExpression: EdgeCardinalityExpression
    {
        protected EdgeMaxCardinailityExpression(
            Edge             edge,
            int              cardinality,
            VertexExpression vertexExpression
            ) : base(
                edge,
                cardinality,
                vertexExpression)
        {
            VertexExpression = vertexExpression;
        }

        public override bool Classifies(
            object vertex
            ) => Edge
                .SelectIn(Vertex)
                .Where(v => VertexExpression != null ? VertexExpression.Classifies(v) : true)
                .Count() <= 0;
    }

    public class EdgeExactCardinailityExpression: EdgeCardinalityExpression
    {
        protected EdgeExactCardinailityExpression(
            Edge             edge,
            int              cardinality,
            VertexExpression vertexExpression
            ) : base(
                edge,
                cardinality,
                vertexExpression)
        {
            VertexExpression = vertexExpression;
        }

        public override bool Classifies(
            object vertex
            ) => (VertexExpression != null ?
                Edge.SelectIn(Vertex).Count(VertexExpression.Classifies) :
                Edge.SelectIn(Vertex).Count()) == Cardinality;
    }
}
