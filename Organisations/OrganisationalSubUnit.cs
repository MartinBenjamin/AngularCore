using System;

namespace Organisations
{
    public class OrganisationalSubUnit: Organisation
    {
        public virtual Organisation Organisation { get; protected set; }

        protected OrganisationalSubUnit() : base()
        {
        }

        public OrganisationalSubUnit(
            Guid         id,
            string       name,
            string       acronym,
            Organisation organisation
            ) : base(
                id,
                name,
                acronym)
        {
            Organisation = organisation;
            Organisation?.Add(this);
        }

        public OrganisationalSubUnit(
            string       name,
            string       acronym,
            Organisation organisation
            ) : this(
                Guid.NewGuid(),
                name,
                acronym,
                organisation)
        {
        }
    }
}
