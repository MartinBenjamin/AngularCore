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
        public static IList<IClassAxiom> ClassAxioms = new List<IClassAxiom>();

        // Abstract Syntax does not support annotation of SubClass Axioms.
        // Functional Syntax does not support Class Axioms with nested descriptions.

        public static Class<Deal> Deal;
        public static Class<Deal> ProjectFinance;
        public static SubClass<Deal> NameMandatory;
        public static SubClass<Deal> SponsorCardinality;

        static PF()
        {
            var DomainObject = new Class<DomainObject<Guid>>();
            new HasKey<DomainObject<Guid>, Guid>(DomainObject, domainObject => domainObject.Id);
            var Named       = new Class<Named<Guid>>();
            var Role        = new Class<Role>();
            var LegalEntity = new Class<LegalEntity>();
            var LenderRole  = new Individual<Role>(Role, null);
            var AdvisorRole = new Individual<Role>(Role, null);
            var SponsorRole = new Individual<Role>(Role, null);
            var Mufg        = new Individual<LegalEntity>(LegalEntity, null);
            ClassAxioms.Add(new SubClass<Named<Guid>>(Named, DomainObject));
            ClassAxioms.Add(new SubClass<Role>(Role, Named));
            var KeyCounterpartyRole  = new ObjectOneOf<Role>();
            var LenderParty          = new ObjectHasValue<DealParty, Role>(dealParty => dealParty.Role, LenderRole);
            var AdvisorParty         = new ObjectHasValue<DealParty, Role>(dealParty => dealParty.Role, AdvisorRole);
            var SponsorParty         = new ObjectHasValue<DealParty, Role>(dealParty => dealParty.Role, SponsorRole);
            var MufgParty            = new ObjectHasValue<DealParty, Organisation>(dealParty => dealParty.Organisation, Mufg);
            var MufgLenderParty      = new ObjectIntersectionOf<DealParty>(LenderParty, MufgParty);
            var MufgAdvisorParty     = new ObjectIntersectionOf<DealParty>(AdvisorParty, MufgParty);
            var KeyCounterpartyParty = new ObjectAllValuesFrom<DealParty, Role>(dealParty => dealParty.Role, KeyCounterpartyRole);

            Deal = new Class<Deal>();

            NameMandatory = new SubClass<Deal>(
                Deal,
                new DataSomeValuesFrom<Named<Guid>, string>(
                    named => named.Name,
                    new DataComplementOf<string>(new DataOneOf<string>(string.Empty))));
            ClassAxioms.Add(NameMandatory);
            var Debt = new Class<Deal>(
                new ObjectExactCardinality<Deal, DealParty>(
                    deal => deal.Parties,
                    1,
                    MufgLenderParty));
            var Advisory = new Class<Deal>(
                new ObjectExactCardinality<Deal, DealParty>(
                    deal => deal.Parties,
                    1,
                    MufgAdvisorParty));

            ClassAxioms.Add(new SubClass<Deal>(Debt, Deal));
            ClassAxioms.Add(new SubClass<Deal>(Advisory, Deal));


            ObjectCardinalityExpression<Deal, DealParty> SponsorsCardinality = new ObjectMinCardinality<Deal, DealParty>(
                deal => deal.Parties,
                1,
                SponsorParty);

            ProjectFinance = new Class<Deal>(
                new DataHasValue<Deal, string>(
                    deal => deal.ClassName,
                    "ProjectFinance"));
            ClassAxioms.Add(new SubClass<Deal>(
                ProjectFinance,
                Debt));
            ClassAxioms.Add(SponsorCardinality = new SubClass<Deal>(
                ProjectFinance,
                SponsorsCardinality));

            var Sponsor = new Class<Sponsor>();
            new SubClass<Sponsor>(Sponsor, SponsorParty);
            ClassAxioms.Add(new SubClass<Sponsor>(
                Sponsor,
                new ObjectExactCardinality<Sponsor, decimal?>(
                    sponsor => sponsor.Equity,
                    1)));

            IIndividual<Organisation> a = null;
            IIndividual<LegalEntity> b = null;
            a = b;
            //b = a;
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
