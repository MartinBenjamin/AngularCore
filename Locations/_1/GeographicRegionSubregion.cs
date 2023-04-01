using System;
using System.Collections.Generic;
using System.Text;

namespace Locations._1
{
    public class GeographicRegionSubregion
    {
        public virtual GeographicRegion    Region    { get; protected set; }
        public virtual GeographicSubregion Subregion { get; protected set; }

        protected GeographicRegionSubregion()
        {
        }

        public GeographicRegionSubregion(
            GeographicRegion    region,
            GeographicSubregion subregion
            )
        {
            Region    = region;
            Subregion = subregion;
        }

        public override bool Equals(
            object obj
            )
        {
            var rhs = obj as GeographicRegionSubregion;
            return
                rhs       != null       &&
                Region    == rhs.Region &&
                Subregion == rhs.Subregion;
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(
                Region,
                Subregion);
        }
    }
}
