using System;

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

            Region.AddSubregion(Subregion);
            Subregion.AddRegion(Region);
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

        public override int GetHashCode() =>
            HashCode.Combine(
                Region,
                Subregion);
    }
}
