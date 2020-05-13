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

    public static class PF
    {
        public static ClassExpression<Role> LenderRole = new PropertyHasValue<Role, Guid>(
            role => role.Id,
            DealRoleIdentifier.Lender);

        public static ClassExpression<Organisation> Mufg = new PropertyHasValue<Organisation, Guid>(
            legalEntity => legalEntity.Id,
            LegalEntityIdentifier.Mufg);

        public static ClassExpression<DealParty> MufgAsLender = new Intersection<DealParty>(
            new PropertySomeValues<DealParty, Role>(
                dealParty => dealParty.Role,
                LenderRole),
            new PropertySomeValues<DealParty, Organisation>(
                dealParty => dealParty.Organisation,
                Mufg));

        public static Class<Deal> Deal = new Class<Deal>();

        public static Class<Deal> Debt = new Class<Deal>(
            new PropertyExactCardinality<Deal, DealParty>(
                deal => deal.Parties,
                1,
                MufgAsLender));

        public static ClassAxiom<Deal> DebtInheritsFromDeal = new SubClass<Deal>(
            Debt,
            Deal);

        public static ClassExpression<Role> SponsorRole = new PropertyHasValue<Role, Guid>(
            role => role.Id,
            DealRoleIdentifier.Sponsor);

        public static ClassExpression<DealParty> SponsorParty = new PropertySomeValues<DealParty, Role>(
            dealParty => dealParty.Role,
            SponsorRole);

        public static ClassExpression<Deal> SponsorsMinCardinality = new PropertyMinCardinality<Deal, DealParty>(
            deal => deal.Parties,
            1,
            SponsorParty);

        //public static ClassExpression<Deal> ProjectFinance = new PropertyHasValue<Deal, string>(
        //    deal => deal.Class,
        //    "ProjectFinance");

        public static Class<Deal> ProjectFinance = new Class<Deal>(
            new PropertyHasValue<Deal, string>(
                deal => deal.Class,
                "ProjectFinance"));
        // Use for configuration.
        public static ClassAxiom<Deal> ProjectFinanceSubClassOfDebt = new SubClass<Deal>(
            ProjectFinance,
            Debt);
        // Use for validation.
        public static ClassAxiom<Deal> x = new SubClass<Deal>(
            ProjectFinance,
            SponsorsMinCardinality);
        public static ClassAxiom<Sponsor> y = new SubClass<Sponsor>(
            new Class<Sponsor>(),
            new PropertyExactCardinality<Sponsor, decimal?>(
                sponsor => sponsor.Equity,
                1));
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
