using Iso3166._1;
using Organisations;
using System;

namespace LegalEntities
{
    public class LegalEntity: Organisation
    {
        public virtual Country DomiciledIn { get; protected set; }

        protected LegalEntity() : base()
        {
        }

        public LegalEntity(
            Guid    id,
            string  name,
            string  acronym,
            Country domiciledIn
            ) : base(
                id,
                name,
                acronym)
        {
            DomiciledIn = domiciledIn;
        }

        public LegalEntity(
            string  name,
            string  acronym,
            Country domiciledIn
            ) : this(
                Guid.NewGuid(),
                name,
                acronym,
                domiciledIn)
        {
        }
    }
}
