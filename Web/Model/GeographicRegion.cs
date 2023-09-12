using System;

namespace Web.Model
{
    public class GeographicRegion: Named<Guid>
    {
        public GeographicRegionType Type { get; protected set; }
    }

    public enum GeographicRegionType
    {
        Iso3166_1Country,
        Iso3166_2Subdivision,
        UnsdM49Global,
        UnsdM49Region,
        UnsdM49SubRegion,
        UnsdM49IntermediateRegion
    }
}
