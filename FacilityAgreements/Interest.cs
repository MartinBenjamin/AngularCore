using Expressions;
using System;

namespace FacilityAgreements
{
    public abstract class Interest: FacilityCommitment
    {
        public virtual ReferenceRate                ReferenceRate   { get; protected set; }
        public virtual Expression<decimal?>         EstimatedMargin { get; protected set; }
        public virtual Function<DateTime, decimal?> Margin          { get; protected set; }

        protected Interest() : base()
        {
        }

        protected Interest(
            Guid                         id,
            Facility                     facility,
            ReferenceRate                referenceRate,
            Expression<decimal?>         estimatedMargin,
            Function<DateTime, decimal?> margin
            ) : base(
                id,
                facility,
                null)
        {
            ReferenceRate   = referenceRate;
            EstimatedMargin = estimatedMargin;
            Margin          = margin;
        }
    }
}
