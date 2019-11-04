using System;

namespace FacilityAgreements
{
    public abstract class CommitmentFee: FacilityCommitment
    {
        public NumericExpression            Estimated { get; protected set; }
        public TimeVaryingNumericExpression Actual    { get; protected set; }

        protected CommitmentFee() : base()
        {
        }

        protected CommitmentFee(
            Guid                         id,
            Facility                     facility,
            NumericExpression            estimated,
            TimeVaryingNumericExpression actual
            ) : base(
                id,
                facility)
        {
            Estimated = estimated;
            Actual    = actual;
        }
    }
}
