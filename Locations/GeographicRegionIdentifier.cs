using Identifiers;

namespace Locations
{
    public class GeographicRegionIdentifier: Identifier
    {
        public virtual GeographicRegion GeographicRegion { get; protected set; }

        protected GeographicRegionIdentifier() : base()
        {
        }

        public GeographicRegionIdentifier(
            IdentificationScheme scheme,
            string               tag,
            GeographicRegion     geographicRegion
            ) : base(
                scheme,
                tag)
        {
            GeographicRegion = geographicRegion;
        }
    }
}
