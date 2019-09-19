using CommonDomainObjects;

namespace UnsdM49
{
    public class IntermediateRegion: GeographicalArea
    {
        protected IntermediateRegion() : base()
        {
        }

        public IntermediateRegion(
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
