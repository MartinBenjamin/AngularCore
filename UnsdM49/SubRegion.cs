using Geophysical;

namespace UnsdM49
{
    public class SubRegion: GeographicalSubArea
    {
        protected SubRegion() : base()
        {
        }

        public SubRegion(
            string           code,
            string           name,
            GeographicalArea area
            ) : base(
                code,
                name,
                area)
        {
        }
    }
}
