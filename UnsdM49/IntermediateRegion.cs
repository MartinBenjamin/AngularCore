using Locations;
using System;

namespace UnsdM49
{
    public class IntermediateRegion: GeographicSubregion
    {
        protected IntermediateRegion() : base()
        {
        }

        public IntermediateRegion(
            Guid   id,
            string name
            ) : base(
                id,
                name)
        {
        }
    }
}
