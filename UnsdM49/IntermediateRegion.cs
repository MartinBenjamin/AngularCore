using Geophysical;

namespace UnsdM49
{
    public class IntermediateRegion: GeographicalSubArea
    {
        protected IntermediateRegion() : base()
        {
        }

        public IntermediateRegion(
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
