using Locations;

namespace UnsdM49
{
    public class Region: GeographicSubregion
    {
        protected Region() : base()
        {
        }

        public Region(
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
