using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;

namespace Locations._1
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
            string           name,
            GeographicRegion region
            ) : base(
                id,
                name)
        {
            _regions = new HashSet<GeographicRegion>();
            if(region != null)
            {
                _regions.Add(region);
                region.AddSubregion(this);
            }
        }
    }
}
