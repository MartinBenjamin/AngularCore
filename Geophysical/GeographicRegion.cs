using CommonDomainObjects;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Geophysical
{
    public abstract class GeographicRegion: Named<string>
    {
        private IList<GeographicSubregion> _subregions;

        public virtual Range<int> Interval { get; protected set; }

        public virtual IReadOnlyList<GeographicSubregion> Subregions
        {
            get
            {
                return new ReadOnlyCollection<GeographicSubregion>(_subregions);
            }
        }

        protected GeographicRegion() : base()
        {
        }

        protected GeographicRegion(
            string id,
            string name
            ) : base(
                id,
                name)
        {
            _subregions = new List<GeographicSubregion>();
        }

        public virtual bool Contains(
            GeographicRegion geographicalRegion
            )
        {
            return Interval.Contains(geographicalRegion.Interval);
        }

        protected internal virtual int AssignInterval(
            int next
            )
        {
            var start = next++;

            foreach(var child in _subregions)
                next = child.AssignInterval(next);

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }

        protected internal virtual void Add(
            GeographicSubregion subregion
            )
        {
            _subregions.Add(subregion);
        }
    }
}
