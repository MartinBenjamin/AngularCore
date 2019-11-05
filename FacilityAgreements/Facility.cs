﻿using Contracts;
using Expressions;
using Iso4217;
using Organisations;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    public class Facility: ContractualCommitment
    {
        public virtual FacilityAgreement         Agreement                 { get; protected set; }
        public virtual string                    Name                      { get; protected set; }
        public virtual Organisation              BookingOffice             { get; protected set; }
        public virtual Variable<decimal?>        TotalCommitments          { get; protected set; }
        public virtual Currency                  Currency                  { get; protected set; }
        public virtual Expression<DateTime?>     AvailabilityPeriodEndDate { get; protected set; }
        public virtual Expression<DateTime?>     MaturityDate              { get; protected set; }
        public virtual IList<FacilityCommitment> Commitments               { get; protected set; }

        protected Facility() : base()
        {
        }

        public Facility(
            Guid                  id,
            FacilityAgreement     agreement,
            string                name,
            Organisation          bookingOffice,
            MoneyAmount           totalCommitments,
            Expression<DateTime?> availabilityPeriodEndDate,
            Expression<DateTime?> maturityDate
            ) : base(
                id,
                agreement)
        {
            Agreement                 = agreement;
            Name                      = name;
            BookingOffice             = bookingOffice;
            Commitments               = new List<FacilityCommitment>();
            TotalCommitments          = new Variable<decimal?>(totalCommitments.Value);
            Currency                  = totalCommitments.Currency;
            AvailabilityPeriodEndDate = availabilityPeriodEndDate;
            MaturityDate              = maturityDate;
            Agreement.Facilities.Add(this);
        }
    }
}
