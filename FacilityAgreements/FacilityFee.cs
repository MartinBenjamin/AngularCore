using Contracts;
using Expressions;
using System;

namespace FacilityAgreements
{
    public class FacilityFee: ContractualCommitment
    {
        public virtual FeeType              Type                 { get; protected set; }
        public virtual Expression<decimal?> Amount               { get; protected set; }
        public virtual Expression<DateTime> ExpectedReceivedDate { get; protected set; }
        public virtual bool                 Received             { get; protected set; }
        public virtual DateTime?            AccrualDate          { get; protected set; }

        protected FacilityFee() : base()
        {
        }

        protected FacilityFee(
            Guid                 id,
            Facility             facility,
            FeeType              type,
            Expression<decimal?> amount,
            Expression<DateTime> expectedReceivedDate,
            bool                 received,
            DateTime?            accrualDate
            ) : base(
                id,
                facility)
        {
            Type                 = type;
            Amount               = amount;
            ExpectedReceivedDate = expectedReceivedDate;
            Received             = received;
            AccrualDate          = accrualDate;
        }
    }
}
