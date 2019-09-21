using System;

namespace CommonDomainObjects
{
    public class AgreementParty: PartyInRole
    {
        public virtual Agreement Agreement { get; protected set; }

        protected AgreementParty() : base()
        {
        }

        public AgreementParty(
            Guid             id,
            Agreement        agreement,
            AutonomousAgent  autonomousAgent,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                autonomousAgent,
                role,
                period)
        {
            Agreement = agreement;
            Agreement.Parties.Add(this);
        }

        public AgreementParty(
            Agreement        agreement,
            AutonomousAgent  autonomousAgent,
            Role             role,
            Range2<DateTime> period
            ) : this(
                Guid.NewGuid(),
                agreement,
                autonomousAgent,
                role,
                period)
        {
        }
    }

    public class AgreementPerson: AgreementParty
    {
        public virtual Person Person { get; protected set; }

        protected AgreementPerson() : base()
        {
        }
        
        public AgreementPerson(
            Guid             id,
            Agreement        agreement,
            Person           person,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                agreement,
                person,
                role,
                period)
        {
            Person = person;
        }

        public AgreementPerson(
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
    }

    public class AgreementOrganisation: AgreementParty
    {
        public virtual Organisation Organisation { get; protected set; }

        protected AgreementOrganisation() : base()
        {
        }

        public AgreementOrganisation(
            Guid             id,
            Agreement        agreement,
            Organisation     organisation,
            Role             role,
            Range2<DateTime> period
            ) : base(
                id,
                agreement,
                organisation,
                role,
                period)
        {
            Organisation = organisation;
        }

        public AgreementOrganisation(
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

    public class AgreementOrganisationalSubUnit: AgreementOrganisation
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
