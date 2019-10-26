using CommonDomainObjects;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Geophysical
{
    public abstract class GeographicalArea: Named<string>
    {
        private IList<GeographicalSubArea> _subAreas;

        public virtual Range<int> Interval { get; protected set; }

        public virtual IReadOnlyList<GeographicalSubArea> SubAreas
        {
            get
            {
                return new ReadOnlyCollection<GeographicalSubArea>(_subAreas);
            }
        }

        protected GeographicalArea() : base()
        {
        }

        protected GeographicalArea(
            string id,
            string name
            ) : base(
                id,
                name)
        {
            _subAreas = new List<GeographicalSubArea>();
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

            foreach(var child in _subAreas)
                next = child.AssignInterval(next);

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }

        protected internal virtual void Add(
            GeographicalSubArea subArea
            )
        {
            _subAreas.Add(subArea);
        }
    }
}
