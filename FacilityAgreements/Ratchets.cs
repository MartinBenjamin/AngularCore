﻿using Expressions;
using System;
using System.Linq;

namespace FacilityAgreements
{
    public class Ratchets: AdHocSchedule<Guid, Ratchets, Ratchet>
    {
        protected Ratchets() : base()
        {
        }

        public Ratchets(
            Guid id
            ) : base(id)
        {
        }
    }

    public class Ratchet: AdHocScheduleEntry<Guid, Ratchets, Ratchet>
    {
        public decimal Rate { get; protected set; }
 
        protected Ratchet() : base()
        {
        }

        public Ratchet(
            Guid                 id,
            Expression<DateTime> date,
            decimal              rate
            ) : base(
                id,
                date)
        {
            Rate = rate;
        }
    }

    public class RatchetsExpression: Expression<DateTime, decimal?>
    {
        public Ratchets Ratchets { get; protected set; }

        protected RatchetsExpression() : base()
        {
        }

        public override decimal? Evaluate(
            DateTime time
            )
        {
            var applicableRatchet = Ratchets
                .Entries
                .Where(ratchet => ratchet.Date.Evaluate() <= time)
                .Aggregate(
                    (Ratchet)null,
                    (selected, next) =>
                        selected == null || next.Date.Evaluate() > selected.Date.Evaluate() ? next : selected);

            return applicableRatchet != null ? (decimal?)applicableRatchet.Rate : null;
        }
    }
}
