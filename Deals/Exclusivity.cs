using Agreements;
using System;

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
            DateTime date
            ) : base(id)
        {
            Date = date;
        }
    }
}
