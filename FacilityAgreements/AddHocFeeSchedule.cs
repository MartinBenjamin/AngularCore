using Expressions;
using System;

namespace FacilityAgreements
{
    public class AdHocFeeSchedule: AdHocSchedule<Guid, AdHocFeeSchedule, AdHocFeeScheduleEntry>
    {
        protected AdHocFeeSchedule() : base()
        {
        }

        public AdHocFeeSchedule(
            Guid id
            ) : base(id)
        {
        }
    }

    public class AdHocFeeScheduleEntry: AdHocScheduleEntry<Guid, AdHocFeeSchedule, AdHocFeeScheduleEntry>
    {
        public virtual Expression<decimal?> Amount       { get; protected set; }
        public virtual DateTime?            ReceivedDate { get; protected set; }
        public virtual bool                 Accrued      { get; protected set; }
        public virtual DateTime?            AccrualDate  { get; protected set; }

        protected AdHocFeeScheduleEntry() : base()
        {
        }

        public AdHocFeeScheduleEntry(
            Guid                 id,
            Expression<DateTime> date,
            Expression<decimal?> amount
            ) : base(
                id,
                date)
        {
            Amount = amount;
        }
    }
}
