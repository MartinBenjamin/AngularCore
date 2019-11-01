using CommonDomainObjects;
using System;

namespace FacilityAgreements
{
    public class Ratchets: AdHocSchedule<Guid, Ratchets, Ratchet>
    {
        protected Ratchets() : base()
        {
        }

        public Ratchets(
            Guid id
            ) : base(id)
        {
        }
    }

    public class Ratchet: AdHocScheduleEntry<Guid, Ratchets, Ratchet>
    {
        public decimal Rate { get; protected set; }
 
        protected Ratchet() : base()
        {
        }

        public Ratchet(
            Guid     id,
            DateTime date,
            decimal  rate
            ) : base(
                id,
                date)
        {
            Rate = rate;
        }
    }
}
