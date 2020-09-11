using System;
using System.Collections.Generic;

namespace Deals
{
    public class Exclusivity: Commitment
    {
        public DateTime? Date { get; protected set; }

        protected Exclusivity() : base()
        {
        }

        public Exclusivity(
            Guid     id,
            Deal     deal,
            DateTime date
            ) : base(
                id,
                deal,
                new List<DealParty>(),
                null)
        {
            Date = date;
        }
    }
}
