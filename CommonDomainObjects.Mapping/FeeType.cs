using NHibernate.Mapping.ByCode.Conformist;

namespace CommonDomainObjects.Mapping
{
    public class FeeType: ClassMapping<FacilityAgreements.FeeType>
    {
        public FeeType()
        {
        }
    }

    public class FacilityFeeType: SubclassMapping<FacilityAgreements.FacilityFeeType>
    {
        public FacilityFeeType()
        {
        }
    }
}
