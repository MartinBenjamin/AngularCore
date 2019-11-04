using System;
using System.Collections.Generic;
using System.Text;

namespace FacilityAgreements
{
    public class ParticipationFee: FacilityCommitment
    {
        protected ParticipationFee() : base()
        {
        }

        protected ParticipationFee(
            Guid                 id,
            Facility             facility,
            Expression<decimal?> amount,
            Expression<DateTime> date
            ) : base(
                id,
                facility)
        {
        }
    }
}
