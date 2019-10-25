using CommonDomainObjects;
using Parties;
using System;

namespace Agreements
{
    public class AgreementParty: Parties.PartyInRole
    {
        public virtual Agreement Agreement { get; protected set; }

        protected AgreementParty() : base()
        {
        }

        public AgreementParty(
            Guid             id,
            Agreement        agreement,
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                person,
                role,
                period)
        {
            Agreement = agreement;
            Agreement.Parties.Add(this);
        }

        public AgreementParty(
            Guid             id,
            Agreement        agreement,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                organisation,
                role,
                period)
        {
            Agreement = agreement;
            Agreement.Parties.Add(this);
        }
        
        public AgreementParty(
            Agreement        agreement,
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                agreement,
                person,
                role,
                period)
        {
        }

        public AgreementParty(
            Agreement        agreement,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                agreement,
                organisation,
                role,
                period)
        {
        }
    }

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
    
    //public class AgreementLegalEntity: AgreementParty
    //{
    //    public virtual LegalEntity LegalEntity { get; protected set; }

    //    protected AgreementLegalEntity() : base()
    //    {
    //    }
        
    //    public AgreementLegalEntity(
    //        Guid             id,
    //        Agreement        agreement,
    //        LegalEntity      legalEntity,
    //        Role             role,
    //        Range2<DateTime> period
    //        ) : base(
    //            id,
    //            agreement,
    //            legalEntity,
    //            role,
    //            period)
    //    {
    //        LegalEntity = legalEntity;
    //    }

    //    public AgreementLegalEntity(
    //        Agreement        agreement,
    //        LegalEntity      legalEntity,
    //        Role             role,
    //        Range2<DateTime> period
    //        ) : this(
    //            Guid.NewGuid(),
    //            agreement,
    //            legalEntity,
    //            role,
    //            period)
    //    {
    //    }
    //}
}
