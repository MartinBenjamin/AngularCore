using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace CommonDomainObjects
{
    public abstract class Organisation: AutonomousAgent
    {
        private IList<OrganisationalSubUnit> _subUnits;

        public virtual string     Acronym  { get; protected set; }
        public virtual Range<int> Interval { get; protected set; }

        public virtual IReadOnlyList<OrganisationalSubUnit> SubAreas
        {
            get
            {
                return new ReadOnlyCollection<OrganisationalSubUnit>(_subUnits);
            }
        }

        protected Organisation() : base()
        {
        }

        protected Organisation(
            Guid   id,
            string name,
            string acronym
            ) : base(
                id,
                name)
        {
            Acronym = acronym;
        }

        public virtual bool Contains(
            Organisation organisation
            )
        {
            return Interval.Contains(organisation.Interval);
        }

        protected internal virtual int AssignInterval(
            int next
            )
        {
            var start = next++;

            foreach(var child in _subUnits)
                next = child.AssignInterval(next);

            Interval = new Range<int>(
                start,
                next++);

            return next;
        }

        protected internal virtual void Add(
            OrganisationalSubUnit subUnit
            )
        {
            _subUnits.Add(subUnit);
        }
    }
}
