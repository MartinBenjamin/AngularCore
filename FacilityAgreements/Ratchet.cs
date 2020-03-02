using Expressions;
using System;
using System.Collections.Generic;
using System.Linq;

namespace FacilityAgreements
{
    public struct Ratchet
    {
        public DateTime Date { get; }
        public decimal  Rate { get; }

        public Ratchet(
            DateTime date,
            decimal rate
            )
        {
            Date = date;
            Rate = rate;
        }
    }

    public class Ratchets: Enumerable<Guid, Ratchet>
    {
        public virtual RatchetSchedule Schedule { get; protected set; }

        protected Ratchets() : base()
        {
        }

        public Ratchets(
            Guid            id,
            RatchetSchedule schedule
            ): base(id)
        {
            Schedule = schedule;
        }

        public override IEnumerator<Ratchet> GetEnumerator()
        {
            return Schedule.Select(entry => new Ratchet(entry.Date.Evaluate(), entry.Rate)).GetEnumerator();
        }
    }

    public class PercentageOfRatchets: Ratchets
    {
        public decimal? Percentage { get; protected set; }

        protected PercentageOfRatchets() : base()
        {
        }

        public PercentageOfRatchets(
            Guid            id,
            RatchetSchedule ratchetSchedule,
            decimal?        percentage
            ) : base(
                id,
                ratchetSchedule)
        {
            Percentage = percentage;
        }

        public override IEnumerator<Ratchet> GetEnumerator()
        {
            return (Percentage == null ?
                Enumerable.Empty<Ratchet>() :
                Schedule.Select(entry => new Ratchet(entry.Date.Evaluate(), entry.Rate * Percentage.Value / 100m))).GetEnumerator();
        }
    }
}
