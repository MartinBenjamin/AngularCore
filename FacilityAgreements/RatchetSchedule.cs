using Expressions;
using System;
using System.Linq;

namespace FacilityAgreements
{
    public class RatchetSchedule: AdHocSchedule<Guid, RatchetSchedule, RatchetScheduleEntry>
    {
        protected RatchetSchedule() : base()
        {
        }

        public RatchetSchedule(
            Guid id
            ) : base(id)
        {
        }
    }

    public class RatchetScheduleEntry: AdHocScheduleEntry<Guid, RatchetSchedule, RatchetScheduleEntry>
    {
        public virtual decimal Rate { get; protected set; }
 
        protected RatchetScheduleEntry() : base()
        {
        }

        public RatchetScheduleEntry(
            Guid                 id,
            Expression<DateTime> date,
            decimal              rate
            ) : base(
                id,
                date)
        {
            Rate = rate;
        }
    }
}
