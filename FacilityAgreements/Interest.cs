using Expressions;
using System;

namespace FacilityAgreements
{
    public abstract class Interest: FacilityCommitment
    {
        public ReferenceRate                  ReferenceRate   { get; protected set; }
        public Expression<decimal?>           EstimatedMargin { get; protected set; }
        public Expression<DateTime, decimal?> Margin          { get; protected set; }

        protected Interest() : base()
        {
        }

        protected Interest(
            Guid                           id,
            Facility                       facility,
            ReferenceRate                  referenceRate,
            Expression<decimal?>           estimatedMargin,
            Expression<DateTime, decimal?> margin
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
