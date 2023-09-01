using Locations._1;
using System;

namespace UnsdM49._1
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
