﻿using Agreements;
using Expressions;
using System;
using System.Collections.Generic;

namespace FacilityAgreements
{
    public class LenderParticipation: FacilityCommitment
    {
        public virtual AgreementParty       Lender                { get; protected set; }
        public virtual Expression<decimal?> Amount                { get; protected set; }
        public virtual decimal?             UnderwriteAmount      { get; protected set; }
        public virtual decimal?             CreditSoughtLimit     { get; protected set; }
        public virtual decimal?             AnticipatedHoldAmount { get; protected set; }
        public virtual decimal?             ActualAllocation      { get; protected set; }

        protected LenderParticipation() : base()
        {
        }

        public LenderParticipation(
            Guid           id,
            Facility       facility,
            AgreementParty lender,
            decimal?       underwriteAmount,
            decimal?       creditSoughtLimit,
            decimal?       anticipatedHoldAmount,
            decimal?       actualAllocation
            ): base(
                id,
                facility,
                new List<AgreementParty> { lender })
        {
            Lender                = lender;
            UnderwriteAmount      = underwriteAmount;
            CreditSoughtLimit     = creditSoughtLimit;
            AnticipatedHoldAmount = anticipatedHoldAmount;
            ActualAllocation      = actualAllocation;
            Amount                = new Variable<decimal?>(actualAllocation ?? anticipatedHoldAmount);
        }
    }
}
