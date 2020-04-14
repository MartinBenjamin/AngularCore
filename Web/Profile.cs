using Agents;
using Iso3166._1;
using Iso3166._2;
using Iso4217;
using Locations;
using Organisations;

namespace Web
{
    public class Profile: AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<Currency              , Model.Currency             >();
            CreateMap<GeographicRegion      , Model.GeographicRegion     >();
            CreateMap<GeographicSubregion   , Model.GeographicalSubregion>();
            CreateMap<Country               , Model.Country              >();
            CreateMap<Subdivision           , Model.Subdivision          >();
            CreateMap<AutonomousAgent       , Model.AutonomousAgent      >();
            CreateMap<Organisation          , Model.Organisation         >();
            CreateMap<OrganisationalSubUnit , Model.OrganisationalSubUnit>();
            CreateMap<Branch                , Model.Branch               >();
        }
    }
}
