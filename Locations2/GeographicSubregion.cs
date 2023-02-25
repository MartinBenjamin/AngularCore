using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace Locations2
{
    public abstract class GeographicSubregion: GeographicRegion
    {
        private IList<GeographicRegion> _regions;

        public virtual IReadOnlyList<GeographicRegion> Regions
            => new ReadOnlyCollection<GeographicRegion>(_regions);

        protected GeographicSubregion() : base()
        {
        }

        protected GeographicSubregion(
            string id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
