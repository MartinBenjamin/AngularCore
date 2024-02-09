using Agents;
using CommonDomainObjects;
using Deals;
using FacilityAgreements;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using LegalEntities;
using LifeCycles;
using Locations;
using Organisations;
using Roles;
using System;

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
                case Country                    country           : return Model.GeographicRegionType.Iso3166_1Country;
                case Subdivision                subdivision       : return Model.GeographicRegionType.Iso3166_2Subdivision;
                case UnsdM49.Global             global            : return Model.GeographicRegionType.UnsdM49Global;
                case UnsdM49.Region             region            : return Model.GeographicRegionType.UnsdM49Region;
                case UnsdM49.SubRegion          subRegion         : return Model.GeographicRegionType.UnsdM49SubRegion;
                case UnsdM49.IntermediateRegion intermediateRegion: return Model.GeographicRegionType.UnsdM49IntermediateRegion;
                default: return default;
            }
        }
    }

    public class Profile: AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<DomainObject<Guid>             , Model.DomainObject<Guid>             >()
                .ForMember(
                    domainObject => domainObject.Class,
                    memberOptions => memberOptions.MapFrom(
                            (source, destination) => $"{destination.GetType().FullName}, {destination.GetType().Assembly.GetName().Name}" )).IncludeAllDerived()
                                                                                               .PreserveReferences();
            CreateMap<Range<int>                     , Model.Range<int>                     >().PreserveReferences();
            CreateMap<ClassificationScheme           , Model.ClassificationScheme           >().PreserveReferences();
            CreateMap<ClassificationSchemeClassifier , Model.ClassificationSchemeClassifier >().PreserveReferences();
            CreateMap<Classifier                     , Model.Classifier                     >()
                .Include<ExclusivityClassifier       , Model.ExclusivityClassifier          >()
                .Include<RestrictedClassifier        , Model.RestrictedClassifier           >()
                .Include<SponsoredClassifier         , Model.SponsoredClassifier            >()
                .Include<LifeCycleStage              , Model.LifeCycleStage                 >()
                .Include<DealType                    , Model.DealType                       >()
                .Include<FeeType                     , Model.FeeType                        >().PreserveReferences();
            CreateMap<ExclusivityClassifier          , Model.ExclusivityClassifier          >().PreserveReferences();
            CreateMap<RestrictedClassifier           , Model.RestrictedClassifier           >().PreserveReferences();
            CreateMap<SponsoredClassifier            , Model.SponsoredClassifier            >().PreserveReferences();
            CreateMap<LifeCycleStage                 , Model.LifeCycleStage                 >().PreserveReferences();
            CreateMap<DealType                       , Model.DealType                       >().PreserveReferences();
            CreateMap<FeeType                        , Model.FeeType                        >().PreserveReferences();
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
            CreateMap<LifeCycle                      , Model.LifeCycle                      >().PreserveReferences();
        }
    }
}
