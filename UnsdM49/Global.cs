using Locations;
using System;

namespace UnsdM49
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
