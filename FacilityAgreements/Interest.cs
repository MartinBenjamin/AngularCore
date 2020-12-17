using Contracts;
using Expressions;
using System;

namespace FacilityAgreements
{
    public abstract class Interest: ContractualCommitment
    {
        public virtual ReferenceRate             ReferenceRate   { get; protected set; }
        public virtual Expression<decimal?>      EstimatedMargin { get; protected set; }
        public virtual Enumerable<Guid, Ratchet> Margin          { get; protected set; }

        protected Interest() : base()
        {
        }

        protected Interest(
            Guid                      id,
            Facility                  facility,
            ReferenceRate             referenceRate,
            Expression<decimal?>      estimatedMargin,
            Enumerable<Guid, Ratchet> margin
            ) : base(
                id,
                facility)
        {
            ReferenceRate   = referenceRate;
            EstimatedMargin = estimatedMargin;
            Margin          = margin;
        }
    }
}
