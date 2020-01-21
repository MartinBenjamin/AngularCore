using Locations;

namespace UnsdM49
{
    public class SubRegion: GeographicSubregion
    {
        protected SubRegion() : base()
        {
        }

        public SubRegion(
            string           code,
            string           name,
            GeographicRegion region
            ) : base(
                code,
                name,
                region)
        {
        }
    }
}
