using Locations._1;
using System;

namespace UnsdM49._1
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
