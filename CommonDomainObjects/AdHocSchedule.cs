﻿using System;
using System.Collections.Generic;

namespace CommonDomainObjects
{
    public abstract class AdHocSchedule<TId, TAdHocSchedule, TAdHocScheduleEntry>: DomainObject<TId>
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
    }

    public abstract class AdHocScheduleEntry<TId, TAdHocSchedule, TAdHocScheduleEntry>: DomainObject<TId>
        where TAdHocSchedule : AdHocSchedule<TId, TAdHocSchedule, TAdHocScheduleEntry>
        where TAdHocScheduleEntry : AdHocScheduleEntry<TId, TAdHocSchedule, TAdHocScheduleEntry>
    {

        public virtual TAdHocSchedule AdHocSchedule { get; protected set; }
        public virtual DateTime       Date          { get; protected set; }

        protected AdHocScheduleEntry() : base()
        {
        }

        protected AdHocScheduleEntry(
            TId      id,
            DateTime date
            ) : base(id)
        {
            Date = date;
        }
    }
}
