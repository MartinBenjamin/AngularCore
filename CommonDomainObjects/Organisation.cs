using System;

namespace CommonDomainObjects
{
    public abstract class Organisation: AutonomousAgent
    {
        public virtual string Acronym { get; protected set; }

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
    }
}
