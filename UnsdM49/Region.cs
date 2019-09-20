using CommonDomainObjects;

namespace UnsdM49
{
    public class Region: GeographicalSubArea
    {
        protected Region() : base()
        {
        }

        public Region(
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
