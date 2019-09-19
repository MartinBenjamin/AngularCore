using CommonDomainObjects;

namespace UnsdM49
{
    public class SubRegion: GeographicalArea
    {
        protected SubRegion() : base()
        {
        }

        public SubRegion(
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
