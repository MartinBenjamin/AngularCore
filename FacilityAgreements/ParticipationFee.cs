using Expressions;
using Iso4217;
using System;

namespace FacilityAgreements
{
    public class ParticipationFee: FacilityCommitment
    {
        protected ParticipationFee() : base()
        {
        }

        protected ParticipationFee(
            Guid                    id,
            Facility                facility,
            Expression<MoneyAmount> amount,
            Expression<DateTime>    date
            ) : base(
                id,
                facility,
                null)
        {
        }
    }
}
