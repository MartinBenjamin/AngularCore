using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Globalization;

namespace CommonDomainObjects
{
    public abstract class GeographicalArea: Named<string>
    {
        private IList<GeographicalArea> _children;

        public virtual GeographicalArea Parent   { get; protected set; }
        public virtual Range<int>       Interval { get; protected set; }

        public virtual IReadOnlyList<GeographicalArea> Children
        {
            get
            {
                return new ReadOnlyCollection<GeographicalArea>(_children);
            }
        }

        protected GeographicalArea() : base()
        {
        }

        protected GeographicalArea(
            string           id,
            string           name,
            GeographicalArea parent
            ) : base(
                id,
                name)
        {
            _children = new List<GeographicalArea>();
            Parent = parent;
            Parent?._children.Add(this);
        }

        public virtual bool Contains(
            GeographicalArea geographicalArea
            )
        {
            return Interval.Contains(geographicalArea.Interval);
        }

        protected internal virtual int AssignInterval(
            int next
            )
        {
            var start = next++;

            foreach(var child in _children)
                next = child.AssignInterval(next);

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }
    }

    // ISO 3166-1
    public class Country: GeographicalArea
    {
        public virtual string Alpha2Code  { get; protected set; }
        public virtual string Alpha3Code  { get; protected set; }
        public virtual string Alpha4Code  { get; protected set; }
        public virtual int    NumericCode { get; protected set; }
        public virtual string ShortName   { get; protected set; }

        protected Country() : base()
        {
        }

        public Country(
            string alpha2Code,
            string alpha3Code,
            string alpha4Code,
            int    numericCode,
            string shortName
            ) : base(
                alpha2Code,
                shortName,
                null)
        {
            Alpha2Code  = alpha2Code;
            Alpha3Code  = alpha3Code;
            Alpha4Code  = alpha4Code;
            NumericCode = numericCode;
            ShortName   = shortName;
        }
    }

    // ISO3166-2
    public class Subdivision: GeographicalArea
    {
        public virtual string      Code              { get; protected set; }
        public virtual Country     Country           { get; protected set; }
        public virtual Subdivision ParentSubdivision { get; protected set; }
        public virtual string      Category          { get; protected set; }

        protected Subdivision() : base()
        {
        }

        public Subdivision(
            string      code,
            string      name,
            Country     country,
            Subdivision parentSubdivision,
            string      category
            ) : base(
                code,
                name,
                (GeographicalArea)parentSubdivision ?? country)
        {
            Code              = code;
            Country           = country;
            ParentSubdivision = parentSubdivision;
            Category          = category;
        }

        public virtual string CategoryTitleCase
        {
            get
            {
                return CultureInfo.CurrentCulture.TextInfo.ToTitleCase(Category);
            }
        }
    }
}
