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

    public abstract class PropertyRestriction: ClassExpression
    {
        public string Name { get; protected set; }

        protected PropertyRestriction(
            string name
            )
        {
            Name = name;
        }
    }

    public class PropertySomeValuesFrom: PropertyRestriction
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

    public class PropertyAllValuesFrom: PropertyRestriction
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

    public class PropertyHasValue: PropertyRestriction
    {
        public object Individual { get; protected set; }

        public PropertyHasValue(
            string name,
            object value
            ) : base(name)
        {

        }
    }

    public class PropertyCardinalityExpression: PropertyRestriction
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
}
