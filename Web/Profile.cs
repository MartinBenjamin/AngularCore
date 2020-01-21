using Iso3166._1;
using Iso3166._2;
using Iso4217;
using Locations;

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
        }
    }
}
