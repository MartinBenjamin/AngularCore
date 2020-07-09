using Agents;
using CommonDomainObjects;
using Deals;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using LegalEntities;
using Locations;
using Organisations;
using Roles;

namespace Web
{
    public class Profile: AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<Range<int>                     , Model.Range<int>                     >().PreserveReferences();
            CreateMap<ClassificationScheme           , Model.ClassificationScheme           >().PreserveReferences();
            CreateMap<ClassificationSchemeClassifier , Model.ClassificationSchemeClassifier >().PreserveReferences();
            CreateMap<Classifier                     , Model.Classifier                     >()
                .Include<ExclusivityClassifier       , Model.ExclusivityClassifier          >().PreserveReferences();
            CreateMap<ExclusivityClassifier          , Model.ExclusivityClassifier          >().PreserveReferences();
            CreateMap<Currency                       , Model.Currency                       >().PreserveReferences();
            CreateMap<GeographicRegion               , Model.GeographicRegion               >()
                .Include<GeographicSubregion         , Model.GeographicSubregion            >()
                .Include<Country                     , Model.Country                        >().PreserveReferences();
            CreateMap<GeographicSubregion            , Model.GeographicSubregion            >()
                .Include<Subdivision                 , Model.Subdivision                    >().PreserveReferences();
            CreateMap<GeographicRegionHierarchy      , Model.GeographicRegionHierarchy      >().PreserveReferences();
            CreateMap<GeographicRegionHierarchyMember, Model.GeographicRegionHierarchyMember>().PreserveReferences();
            CreateMap<Country                        , Model.Country                        >().PreserveReferences();
            CreateMap<Subdivision                    , Model.Subdivision                    >().PreserveReferences();
            CreateMap<AutonomousAgent                , Model.AutonomousAgent                >().PreserveReferences();
            CreateMap<Organisation                   , Model.Organisation                   >().PreserveReferences();
            CreateMap<OrganisationalSubUnit          , Model.OrganisationalSubUnit          >().PreserveReferences();
            CreateMap<Branch                         , Model.Branch                         >().PreserveReferences();
            CreateMap<LegalEntity                    , Model.LegalEntity                    >().PreserveReferences();
            CreateMap<Role                           , Model.Role                           >().PreserveReferences();
        }
    }
}
