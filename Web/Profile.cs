using CommonDomainObjects;
using Iso3166._1;
using Iso3166._2;
using Iso4217;

namespace Web
{
    public class Profile: AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<Currency              , Model.Currency            >();
            CreateMap<GeographicalArea      , Model.GeographicalArea    >();
            CreateMap<GeographicalSubArea   , Model.GeographicalSubArea >();
            CreateMap<Country               , Model.Country             >();
            CreateMap<Subdivision           , Model.Subdivision         >();
        }
    }
}
