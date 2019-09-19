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
}
