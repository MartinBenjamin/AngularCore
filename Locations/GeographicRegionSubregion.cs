using System;

namespace Locations
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
            ) => obj is GeographicRegionSubregion geographicRegionSubregion &&
                Region    == geographicRegionSubregion.Region &&
                Subregion == geographicRegionSubregion.Subregion;

        public override int GetHashCode() =>
            HashCode.Combine(
                Region,
                Subregion);
    }
}
