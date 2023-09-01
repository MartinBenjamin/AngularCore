using Locations._1;
using System;

namespace UnsdM49._1
{
    public class Global: GeographicRegion
    {
        protected Global() : base()
        {
        }

        public Global(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
