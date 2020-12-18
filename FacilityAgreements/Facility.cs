﻿using Contracts;
using Expressions;
using Iso4217;
using System;

namespace FacilityAgreements
{
    public class Facility: ContractualCommitment
    {
        public virtual string                    Name                      { get; protected set; }
        public virtual Variable<decimal?>        TotalCommitments          { get; protected set; }
        public virtual Currency                  Currency                  { get; protected set; }
        public virtual Expression<DateTime?>     AvailabilityPeriodEndDate { get; protected set; }
        public virtual Expression<DateTime?>     MaturityDate              { get; protected set; }
        public virtual bool                      MultiCurrency             { get; protected set; }
        public virtual bool                      Committed                 { get; protected set; }

        protected Facility() : base()
        {
        }

        public Facility(
            Guid                  id,
            Contract              facilityAgreement,
            string                name,
            MoneyAmount           totalCommitments,
            Expression<DateTime?> availabilityPeriodEndDate,
            Expression<DateTime?> maturityDate,
            bool                  multiCurrency,
            bool                  committed
            ) : base(
                id,
                facilityAgreement)
        {
            Name                      = name;
            TotalCommitments          = new Variable<decimal?>(totalCommitments.Value);
            Currency                  = totalCommitments.Currency;
            AvailabilityPeriodEndDate = availabilityPeriodEndDate;
            MaturityDate              = maturityDate;
            MultiCurrency             = multiCurrency;
            Committed                 = committed;
        }
    }
}
