using CommonDomainObjects;

namespace UnsdM49
{
    public class Region: GeographicalArea
    {
        protected Region() : base()
        {
        }

        public Region(
            string code,
            string name
            ) : base(
                code,
                name,
                null)
        {
        }
    }
}
