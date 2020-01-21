using Locations;

namespace UnsdM49
{
    public class IntermediateRegion: GeographicSubregion
    {
        protected IntermediateRegion() : base()
        {
        }

        public IntermediateRegion(
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
