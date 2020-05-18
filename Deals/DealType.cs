using CommonDomainObjects;
using LegalEntities;
using Organisations;
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

    public static class ClassExpressionExtensions
    {
        public static ClassExpression<T> ActiveFromStage<T>(
            this ClassExpression<T> classExpression,
            int                     stageIndex
            )
        {
            return classExpression;
        }
    }

    public static class LegalEntityIdentifier
    {
        public static readonly Guid Mufg = Guid.Empty;
    }

    public class PF
    {
        public static IList<IClassExpression> Classes = new List<IClassExpression>();

        // Abstract Syntax does not support annotation of SubClass Axioms.
        // Functional Syntax does not support Class Axioms with nested descriptions.
        public static ClassExpression<Role> LenderRole = new PropertyValue<Role, Guid>(
            role => role.Id,
            DealRoleIdentifier.Lender);
        public static Role Lender = null;
        public static Role Advisor = null;
        public static LegalEntity Mufg = null;
        public static ClassExpression<DealParty> LenderParty = new PropertyValue<DealParty, Role>(
            dealParty => dealParty.Role,
            Lender);
        public static ClassExpression<DealParty> AdvisorParty = new PropertyValue<DealParty, Role>(
            dealParty => dealParty.Role,
            Advisor);
        public static ClassExpression<DealParty> MufgParty = new PropertyValue<DealParty, Organisation>(
            dealParty => dealParty.Organisation,
            Mufg);
        public static ClassExpression<DealParty> MufgLenderParty = new IntersectionOf<DealParty>(
            LenderParty,
            MufgParty);
        public static ClassExpression<DealParty> MufgAdvisorParty = new IntersectionOf<DealParty>(
            AdvisorParty,
            MufgParty);

        public static Class<Deal> Deal = new Class<Deal>();

        public static ClassAxiom<Deal> NameMandatory = new SubClass<Deal>(
            Deal,
            new PropertySomeValuesFrom<Named<Guid>, string>(
                deal => deal.Name,
                new ComplementOf<string>(new OneOf<string>(string.Empty))));

        public static Class<Deal> Debt = new Class<Deal>(
            new PropertyExactCardinality<Deal, DealParty>(
                deal => deal.Parties,
                1,
                MufgLenderParty));
        public static Class<Deal> Advisory = new Class<Deal>(
            new PropertyExactCardinality<Deal, DealParty>(
                deal => deal.Parties,
                1,
                MufgAdvisorParty));

        public static ClassAxiom<Deal> DebtInheritsFromDeal = new SubClass<Deal>(
            Debt,
            Deal);

        public static Role SponsorRole = null;

        public static ClassExpression<DealParty> SponsorParty = new PropertyValue<DealParty, Role>(
            dealParty => dealParty.Role,
            SponsorRole);

        public static ClassExpression<Deal> SponsorsMinCardinality = new PropertyMinCardinality<Deal, DealParty>(
            deal => deal.Parties,
            1,
            SponsorParty);

        public static Class<Deal> ProjectFinance = new Class<Deal>(
            new PropertyValue<Deal, string>(
                deal => deal.ClassName,
                "ProjectFinance"));
        public static ClassAxiom<Deal> ProjectFinanceSubClassOfDebt = new SubClass<Deal>(
            ProjectFinance,
            Debt);
        public static ClassAxiom<Deal> x = new SubClass<Deal>(
            ProjectFinance,
            SponsorsMinCardinality);

        public static Class<Sponsor> Sponsor = new Class<Sponsor>();
        public static ClassAxiom<Sponsor> SponsorInheritsFromSponsorParty = new SubClass<Sponsor>(
            Sponsor,
            SponsorParty);
        public static ClassAxiom<Sponsor> SponsorEquityMandatory = new SubClass<Sponsor>(
            Sponsor,
            new PropertyExactCardinality<Sponsor, decimal?>(
                sponsor => sponsor.Equity,
                1));

        static PF()
        {
            Classes = new List<IClassExpression>
            {
                Deal,
                ProjectFinance,
                Sponsor
            };
        }

        public static IEnumerable<IClassExpression> Classify(
            object o
            )
        {
            return from ce in Classes where ce.Type == o.GetType() && ce.HasMember(o) select ce;
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
