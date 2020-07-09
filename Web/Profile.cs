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
    public static class GeographicRegionExtensions
    {
        public static Model.GeographicRegionType GetGeographicRegionType(
            this GeographicRegion geographicRegion
            )
        {
            switch(geographicRegion.Object)
            {
                case Iso3166._1.Country         country           : return Model.GeographicRegionType.Iso3166_1Country;
                case Iso3166._2.Subdivision     subdivision       : return Model.GeographicRegionType.Iso3166_2Subdivision;
                case UnsdM49.Global             global            : return Model.GeographicRegionType.UnsdM49Global;
                case UnsdM49.Region             region            : return Model.GeographicRegionType.UnsdM49Region;
                case UnsdM49.SubRegion          subRegion         : return Model.GeographicRegionType.UnsdM49SubRegion;
                case UnsdM49.IntermediateRegion intermediateRegion: return Model.GeographicRegionType.UnsdM49SubRegion;
                default: return default;
            }
        }
    }

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
                .ForMember(
                    geographicRegion => geographicRegion.Type,
                    memberOptions => memberOptions.MapFrom(source => source.GetGeographicRegionType()))
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
