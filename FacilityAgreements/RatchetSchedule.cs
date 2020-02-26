using Expressions;
using System;
using System.Linq;

namespace FacilityAgreements
{
    public class RatchetSchedule: AdHocSchedule<Guid, RatchetSchedule, Ratchet>
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

    public class Ratchet: AdHocScheduleEntry<Guid, RatchetSchedule, Ratchet>
    {
        public virtual decimal Rate { get; protected set; }
 
        protected Ratchet() : base()
        {
        }

        public Ratchet(
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

    public class RatchetFunction: Function<DateTime, decimal?>
    {
        public virtual RatchetSchedule Ratchets { get; protected set; }

        protected RatchetFunction() : base()
        {
        }

        public override decimal? Evaluate(
            DateTime time
            )
        {
            var applicableRatchet = Ratchets
                .Entries
                .Where(ratchet => ratchet.Date.Evaluate() <= time)
                .Aggregate(
                    (Ratchet)null,
                    (selected, next) =>
                        selected == null || next.Date.Evaluate() > selected.Date.Evaluate() ? next : selected);

            return applicableRatchet != null ? (decimal?)applicableRatchet.Rate : null;
        }
    }
}
