using System;
using System.Collections.Generic;

namespace Deals
{
    public class Exclusivity: Commitment
    {
        protected Exclusivity() : base()
        {
        }

        public Exclusivity(
            Guid id,
            Deal deal
            ) : base(
                id,
                deal,
                new List<DealParty>(),
                null)
        {
        }
    }
}
