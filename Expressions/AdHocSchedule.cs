using CommonDomainObjects;
using System;
using System.Collections.Generic;

namespace Expressions
{
    public abstract class AdHocSchedule<TId, TAdHocSchedule, TAdHocScheduleEntry>: Enumerable<TId, TAdHocScheduleEntry>
        where TAdHocSchedule : AdHocSchedule<TId, TAdHocSchedule, TAdHocScheduleEntry>
        where TAdHocScheduleEntry : AdHocScheduleEntry<TId, TAdHocSchedule, TAdHocScheduleEntry>
    {
        public IList<TAdHocScheduleEntry> Entries { get; protected set; }

        protected AdHocSchedule() : base()
        {
        }

        public AdHocSchedule(
            TId id
            ) : base(id)
        {
            Entries = new List<TAdHocScheduleEntry>();
        }

        public override IEnumerator<TAdHocScheduleEntry> GetEnumerator()
        {
            return Entries.GetEnumerator();
        }
    }

    public abstract class AdHocScheduleEntry<TId, TAdHocSchedule, TAdHocScheduleEntry>: DomainObject<TId>
        where TAdHocSchedule : AdHocSchedule<TId, TAdHocSchedule, TAdHocScheduleEntry>
        where TAdHocScheduleEntry : AdHocScheduleEntry<TId, TAdHocSchedule, TAdHocScheduleEntry>
    {

        public virtual TAdHocSchedule       AdHocSchedule { get; protected set; }
        public virtual Expression<DateTime> Date          { get; protected set; }

        protected AdHocScheduleEntry() : base()
        {
        }

        protected AdHocScheduleEntry(
            TId                  id,
            Expression<DateTime> date
            ) : base(id)
        {
            Date = date;
        }
    }
}
