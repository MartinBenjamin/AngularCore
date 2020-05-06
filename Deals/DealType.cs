using CommonDomainObjects;
using Roles;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Deals
{
    public class DealType: Named<Guid>
    {
        public virtual IList<Role> KeyCounterparties { get; protected set; }

        protected DealType() : base()
        {
        }
    }

    public class DealTypeConstraint: DomainObject<int>
    {

    }

    public abstract class ClassExpression
    {
        public virtual void Validate(object obj, IDictionary<object, IList<ClassExpression>> errors)
        {

        }

        protected virtual bool Evaluate(
            object obj
            )
        {
            return false;
        }
    }

    public class IntersectionOf: ClassExpression
    {
        public IList<ClassExpression> ClassExpressions { get; protected set; }

        public IntersectionOf(params ClassExpression[] classExpressions)
        {
            ClassExpressions = classExpressions;
        }
    }

    public class UnionOf: ClassExpression
    {
        public IList<ClassExpression> ClassExpressions { get; protected set; }

        public UnionOf(params ClassExpression[] classExpressions)
        {
            ClassExpressions = classExpressions;
        }
    }

    public class ComplementOf: ClassExpression
    {
        public ComplementOf(ClassExpression classExpression)
        {
        }
    }

    public class OneOf: ClassExpression
    {
        public IList<object> Individuals { get; protected set; }

        public OneOf(params object[] individuals)
        {

        }

    }

    public abstract class PropertyExpression: ClassExpression
    {
        public string Name { get; protected set; }

        protected PropertyExpression(
            string name
            )
        {
            Name = name;
        }
    }

    public class PropertySomeValuesFrom: PropertyExpression
    {
        public ClassExpression ClassExpression { get; protected set; }

        public PropertySomeValuesFrom(
            string          name,
            ClassExpression classExpression
            ) : base(name)
        {
            ClassExpression = classExpression;
        }
    }

    public class PropertyAllValuesFrom: PropertyExpression
    {
        public ClassExpression ClassExpression { get; protected set; }

        public PropertyAllValuesFrom(
            string          name,
            ClassExpression classExpression
            ) : base(name)
        {
            ClassExpression = classExpression;
        }
    }

    public class PropertyHasValue: PropertyExpression
    {
        public object Individual { get; protected set; }

        public PropertyHasValue(
            string name,
            object value
            ) : base(name)
        {

        }
    }

    public class PropertyCardinalityExpression: PropertyExpression
    {
        public int             Cardinality     { get; protected set; }
        public ClassExpression ClassExpression { get; protected set; }

        protected PropertyCardinalityExpression(
            string name,
            int    cardinality
            ) : base(name)
        {
            Cardinality = cardinality;
        }
    }

    public class PropertyMinCardinality: PropertyCardinalityExpression
    {
        public PropertyMinCardinality(
            string          name,
            int             cardinality,
            ClassExpression classExpression = null
            ) : base(
                name,
                cardinality)
        {
        }
    }

    public class PropertyMaxCardinality: PropertyCardinalityExpression
    {
        public PropertyMaxCardinality(
            string          name,
            int             cardinality,
            ClassExpression classExpression = null
            ) : base(
                name,
                cardinality)
        {
        }
    }

    public class PropertyExactCardinality: PropertyCardinalityExpression
    {
        public PropertyExactCardinality(
            string          name,
            int             cardinality,
            ClassExpression classExpression = null
            ) : base(
                name,
                cardinality)
        {
        }
    }

    public class CustomClassExpression<T>: ClassExpression
    {
        private Func<T, bool> Expression { get; set; }

        protected override bool Evaluate(object obj)
            => Expression((T)obj);

        public CustomClassExpression(Func<T, bool> expression)
        {

        }
    }

    public interface IOutEdge<in TOut>
    {
        void Visit(TOut tout);
    }

    public static class PF
    {
        public static void Test()
        {
            IOutEdge<Deal> d = null;
            IOutEdge<DomainObject<Guid>> dobj = null;
            d = dobj;
        }

        public static ClassExpression SponsorRole = new PropertyHasValue(
            "Id",
            DealRoleIdentifier.Sponsor);

        public static ClassExpression HasSponsorRole = new PropertyHasValue(
            "Role",
            SponsorRole);
        public static ClassExpression SponsorsMinCardinality = new PropertyMinCardinality(
            "DealParty",
            1,
            HasSponsorRole);
        public static ClassExpression SponsorsMaxCardinality = new PropertyMaxCardinality(
            "DealParty",
            int.MaxValue,
            HasSponsorRole);

        public static ClassExpression Sponsor = new IntersectionOf(
            new PropertyExactCardinality(
                "Equity",
                1));

        public static OneOf KeyCounterpartyRole = new OneOf();
        public static ClassExpression KeyCounterparty = new PropertySomeValuesFrom(
            "Role",
            KeyCounterpartyRole);
        public static ClassExpression KeyCounterpartyMinCardinality = new PropertyMinCardinality(
            "DealParty",
            1,
            KeyCounterparty);
        public static ClassExpression KeyCounterpartyMaxCardinality = new PropertyMaxCardinality(
            "DealParty",
            int.MaxValue,
            KeyCounterparty);

        public static ClassExpression Deal = new IntersectionOf(
            SponsorsMinCardinality,
            SponsorsMaxCardinality,
            KeyCounterpartyMinCardinality,
            KeyCounterpartyMaxCardinality);
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
