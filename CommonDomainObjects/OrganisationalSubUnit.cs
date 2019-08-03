using System;

namespace CommonDomainObjects
{
    public class OrganisationalSubUnit: Organisation
    {
        protected OrganisationalSubUnit() : base()
        {
        }

        public OrganisationalSubUnit(
            Guid   id,
            string name,
            string acronym
            ) : base(
                id,
                name,
                acronym)
        {
        }

        public OrganisationalSubUnit(
            string name,
            string acronym
            ) : this(
                Guid.NewGuid(),
                name,
                acronym)
        {
        }
    }
}
