using Expressions;
using Iso4217;
using System;

namespace FacilityAgreements
{
    public class FacilityFee: FacilityCommitment
    {
        public virtual Expression<decimal?> Amount { get; protected set; }
        public virtual Expression<DateTime> Date   { get; protected set; }

        protected FacilityFee() : base()
        {
        }

        protected FacilityFee(
            Guid                 id,
            Facility             facility,
            Expression<decimal?> amount,
            Expression<DateTime> date
            ) : base(
                id,
                facility,
                null)
        {
            Amount = amount;
            Date   = date;
        }
    }
}
