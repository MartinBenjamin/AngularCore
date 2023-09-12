using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Locations
{
    public class GeographicSubregion: GeographicRegion
    {
        private ISet<GeographicRegion> _regions;

        public virtual IReadOnlyList<GeographicRegion> Regions
            => new ReadOnlyCollection<GeographicRegion>(_regions.ToList());

        protected GeographicSubregion() : base()
        {
        }

        protected GeographicSubregion(
            Guid             id,
            string           name
            ) : base(
                id,
                name)
        {
            _regions = new HashSet<GeographicRegion>();
        }

        protected internal virtual void AddRegion(
            GeographicRegion region
            )
        {
            _regions.Add(region);
        }
    }
}
