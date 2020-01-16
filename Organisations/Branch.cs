using System;

namespace Organisations
{
    public class Branch: OrganisationalSubUnit
    {
        protected Branch(): base()
        {
        }

        public Branch(
            Guid         id,
            string       name,
            string       acronym,
            Organisation organisation
            ) : base(
                id,
                name,
                acronym,
                organisation)
        {
        }

        public Branch(
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
