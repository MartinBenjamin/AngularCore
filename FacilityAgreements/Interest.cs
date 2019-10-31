using System;

namespace FacilityAgreements
{
    public abstract class Interest: FacilityContractualCommitment
    {
        public ReferenceRate ReferenceRate { get; protected set; }

        protected Interest() : base()
        {
        }

        protected Interest(
            Guid          id,
            Facility      facility,
            ReferenceRate referenceRate
            ) : base(
                id,
                facility)
        {
            ReferenceRate = referenceRate;
        }
    }
}
