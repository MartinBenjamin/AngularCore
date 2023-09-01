using Locations._1;
using System;

namespace UnsdM49._1
{
    public class SubRegion: GeographicSubregion
    {
        protected SubRegion() : base()
        {
        }

        public SubRegion(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
