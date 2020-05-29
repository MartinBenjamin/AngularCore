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

        public static Class<Deal>      Deal;
        public static IClassExpression ProjectFinance;

        public DealOntology()
        {
            var DomainObject = new Class<DomainObject<Guid>>(this);
            //new HasKey<DomainObject<Guid>, Guid>(DomainObject, domainObject => domainObject.Id);
            var Named        = new Class<Named<Guid>>(this);
            var Role         = new Class<Role>(this);
            var Organisation = new Class<Organisation>(this);
            var LegalEntity  = new Class<LegalEntity>(this);
            var DealParty    = new Class<DealParty>(this);
            var IdProperty   = new DataProperty<DomainObject<Guid>, Guid>(this, DomainObject, domainObject => domainObject.Id);
            var NameProperty = new DataProperty<Named<Guid>, string>(this, Named, named => named.Name);

            Id = IdProperty;
            new HasKey(DomainObject, IdProperty);
            new HasKey(Role        , IdProperty);
            new HasKey(LegalEntity , IdProperty);
            ClassAxioms.Add(new SubClassOf(Named, DomainObject));
            ClassAxioms.Add(new SubClassOf(Role, Named));
            var RoleProperty         = new ObjectProperty<DealParty, Role>(this, DealParty, Role, dealParty => dealParty.Role);
            var OrganisationProperty = new ObjectProperty<DealParty, Organisation>(this, DealParty, Organisation, dealParty => dealParty.Organisation);
            var KeyCounterpartyRole  = new ObjectOneOf(this, KeyCounterpartyRoles);
            var LenderParty          = new ObjectHasValue(RoleProperty, LenderRole );
            var AdvisorParty         = new ObjectHasValue(RoleProperty, AdvisorRole);
            var SponsorParty         = new ObjectHasValue(RoleProperty, SponsorRole);
            var MufgParty            = new ObjectHasValue(OrganisationProperty, Mufg);
            var MufgLenderParty      = new ObjectIntersectionOf(LenderParty, MufgParty);
            var MufgAdvisorParty     = new ObjectIntersectionOf(AdvisorParty, MufgParty);
            var KeyCounterpartyParty = new ObjectSomeValuesFrom(RoleProperty, KeyCounterpartyRole);

            Deal = new Class<Deal>(this);
            var PartiesProperty = new ObjectProperty<Deal, DealParty>(this, Deal, DealParty, deal => deal.Parties);

            NameMandatory = new SubClassOf(
                Deal,
                new DataSomeValuesFrom(
                    NameProperty,
                    new DataComplementOf(new DataOneOf(string.Empty))));
            ClassAxioms.Add(NameMandatory);
            var Debt = new ObjectExactCardinality(
                PartiesProperty,
                1,
                MufgLenderParty);
            var Advisory = new ObjectExactCardinality(
                PartiesProperty,
                1,
                MufgAdvisorParty);

            ClassAxioms.Add(new SubClassOf(Debt, Deal));
            ClassAxioms.Add(new SubClassOf(Advisory, Deal));

            var SponsorsCardinality = new ObjectMinCardinality(
                PartiesProperty,
                1,
                SponsorParty);

            var DealClassName = new DataProperty<Deal, string>(this, Deal, deal => deal.ClassName);

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
            var EquityProperty = new DataProperty<Sponsor, decimal?>(this, Sponsor, sponsor => sponsor.Equity);

            ClassAxioms.Add(new SubClassOf(
                Sponsor,
                new DataExactCardinality(
                    EquityProperty,
                    1)));
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
