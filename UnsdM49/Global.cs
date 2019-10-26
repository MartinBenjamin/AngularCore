using Geophysical;

namespace UnsdM49
{
    public class Global: GeographicalArea
    {
        protected Global() : base()
        {
        }

        public Global(
            string code,
            string name
            ) : base(
                code,
                name)
        {
        }
    }
}
