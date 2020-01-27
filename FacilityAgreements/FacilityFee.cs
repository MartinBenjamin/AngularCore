using Expressions;
using System;

namespace FacilityAgreements
{
    public class FacilityFee: FacilityCommitment
    {
        public virtual FeeType              Type   { get; protected set; }
        public virtual Expression<decimal?> Amount { get; protected set; }
        public virtual Expression<DateTime> Date   { get; protected set; }

        protected FacilityFee() : base()
        {
        }

        protected FacilityFee(
            Guid                 id,
            Facility             facility,
            FeeType              type,
            Expression<decimal?> amount,
            Expression<DateTime> date
            ) : base(
                id,
                facility)
        {
            Type   = type;
            Amount = amount;
            Date   = date;
        }
    }
}
