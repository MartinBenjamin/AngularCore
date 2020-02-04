using Iso3166._1;
using Organisations;
using System;

namespace LegalEntities
{
    public class LegalEntity: Organisation
    {
        public virtual Country Country { get; protected set; }

        protected LegalEntity() : base()
        {
        }

        public LegalEntity(
            Guid    id,
            string  name,
            string  acronym,
            Country country
            ) : base(
                id,
                name,
                acronym)
        {
            Country = country;
        }

        public LegalEntity(
            string  name,
            string  acronym,
            Country country
            ) : this(
                Guid.NewGuid(),
                name,
                acronym,
                country)
        {
        }
    }
}
