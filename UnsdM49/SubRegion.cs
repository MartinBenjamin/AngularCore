using Locations;
using System;

namespace UnsdM49
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
