using CommonDomainObjects;
using Organisations;
using System;

namespace Agreements
{
    public class AgreementOrganisationalSubUnit: AgreementParty
    {
        public virtual OrganisationalSubUnit OrganisationalSubUnit { get; protected set; }

        protected AgreementOrganisationalSubUnit() : base()
        {
        }

        public AgreementOrganisationalSubUnit(
            Guid                  id,
            Agreement             agreement,
            OrganisationalSubUnit organisationalSubUnit,
            Role                  role,
            Range2<DateTime>      period
            ) : base(
                id,
                agreement,
                organisationalSubUnit,
                role,
                period)
        {
            OrganisationalSubUnit = organisationalSubUnit;
        }

        public AgreementOrganisationalSubUnit(
            Agreement             agreement,
            OrganisationalSubUnit organisationalSubUnit,
            Role                  role,
            Range2<DateTime>      period
            ) : this(
                Guid.NewGuid(),
                agreement,
                organisationalSubUnit,
                role,
                period)
        {
        }
    }
}
