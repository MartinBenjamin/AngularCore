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
        //public IList<ClassExpression> ClassExpressions { get; protected set; }

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

    public static class PF
    {
        public static ClassExpression SponsorRole = new PropertyHasValue(
            "Id",
            DealRoleIdentifier.Sponsor);

        public static ClassExpression Sponsor = new PropertyHasValue(
            "Role",
            SponsorRole);
        public static ClassExpression SponsorsMinCardinality = new PropertyMinCardinality(
            "DealParty",
            1,
            Sponsor);
        public static ClassExpression SponsorsMaxCardinality = new PropertyMaxCardinality(
            "DealParty",
            int.MaxValue,
            Sponsor);
        public static ClassExpression SponsorEquity = new ComplementOf(
            new IntersectionOf(
                Sponsor,
                new PropertyExactCardinality(
                    "Equity",
                    0)));
        public static ClassExpression Sponsors = new IntersectionOf(
            SponsorsMinCardinality,
            SponsorsMaxCardinality,
            SponsorEquity);

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

        public static ClassExpression Dt = new UnionOf(
            SponsorsMinCardinality,
            SponsorsMaxCardinality,
            KeyCounterpartyMinCardinality,
            KeyCounterpartyMaxCardinality);
    }

    public class SubGraph
    {
        public SubGraph                Super             { get; protected set; }
        public Graph                   Graph             { get; protected set; }
        public IList<VertexExpression> VertexExpressions { get; protected set; }

        public void Validate(
            IDictionary<Type, IList<object>>             graph,
            IDictionary<object, IList<VertexExpression>> errors
            )
        {
            //if(Super != null)
            //    Super.Validate(
            //        graph,
            //        errors);

            // Validate data properties.
            // If property fails less restrictive do we want to apply more restrictions.
            (
                from pair in graph
                from vertex in pair.Value
                from subGraph in GetSubGraphs()
                from dpe in subGraph.VertexExpressions
                where dpe is DataPropertyExpression && pair.Key == dpe.Vertex && !dpe.Validate(vertex)
                group dpe by vertex into dpesGroupedByVertex
                select dpesGroupedByVertex
            ).ForEach(
                group =>
                {
                    if(!errors.TryGetValue(
                        group.Key,
                        out IList<VertexExpression> vertices
                        ))
                    {
                        var vertexExprsssions = vertices.ToList();
                        vertexExprsssions.AddRange(group);
                        errors[group.Key] = vertexExprsssions;
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

        public abstract bool Validate(object vertex);
    }

    public abstract class EdgeExpression: VertexExpression
    {
        public Type In { get; protected set; }
    }

    public abstract class DataPropertyExpression: VertexExpression
    {

    }
}
