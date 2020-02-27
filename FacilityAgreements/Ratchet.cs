using Expressions;
using System;

namespace FacilityAgreements
{
    public struct Ratchet
    {
        public DateTime Date { get; }
        public decimal  Rate  { get; }

        public Ratchet(
            DateTime date,
            decimal rate
            )
        {
            Date = date;
            Rate = rate;
        }
    }

    public class Ratchets: Selection<Guid, Ratchet, RatchetScheduleEntry>
    {

        protected Ratchets() : base()
        {
        }

        public Ratchets(
            Guid id,
            RatchetSchedule ratchetSchedule
            ): base(
                id,
                ratchetSchedule,
                (RatchetScheduleEntry entry)=> new Ratchet(entry.Date.Evaluate(), entry.Rate))
        {
        }
    }
}
