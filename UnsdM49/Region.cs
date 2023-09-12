using Locations;
using System;

namespace UnsdM49
{
    public class Region: GeographicSubregion
    {
        protected Region() : base()
        {
        }

        public Region(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
