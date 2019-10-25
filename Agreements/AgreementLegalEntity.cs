using CommonDomainObjects;
using LegalEntities;
using System;

namespace Agreements
{
    public class AgreementLegalEntity: AgreementParty
    {
        public virtual LegalEntity LegalEntity { get; protected set; }

        protected AgreementLegalEntity() : base()
        {
        }

        public AgreementLegalEntity(
            Guid             id,
            Agreement        agreement,
            LegalEntity      legalEntity,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                agreement,
                legalEntity,
                role,
                period)
        {
            LegalEntity = legalEntity;
        }

        public AgreementLegalEntity(
            Agreement        agreement,
            LegalEntity      legalEntity,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                agreement,
                legalEntity,
                role,
                period)
        {
        }
    }
}
