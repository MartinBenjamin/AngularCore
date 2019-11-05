using Expressions;
using System;

namespace FacilityAgreements
{
    public abstract class CommitmentFee: FacilityCommitment
    {
        public Expression<decimal?>           Estimated { get; protected set; }
        public Expression<DateTime, decimal?> Actual    { get; protected set; }

        protected CommitmentFee() : base()
        {
        }

        protected CommitmentFee(
            Guid                           id,
            Facility                       facility,
            Expression<decimal?>           estimated,
            Expression<DateTime, decimal?> actual
            ) : base(
                id,
                facility)
        {
            Estimated = estimated;
            Actual    = actual;
        }
    }
}
