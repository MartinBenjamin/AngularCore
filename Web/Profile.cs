﻿using Agents;
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
            CreateMap<Currency              , Model.Currency             >().PreserveReferences();
            CreateMap<GeographicRegion      , Model.GeographicRegion     >().PreserveReferences();
            CreateMap<GeographicSubregion   , Model.GeographicalSubregion>().PreserveReferences();
            CreateMap<Country               , Model.Country              >().PreserveReferences();
            CreateMap<Subdivision           , Model.Subdivision          >().PreserveReferences();
            CreateMap<AutonomousAgent       , Model.AutonomousAgent      >().PreserveReferences();
            CreateMap<Organisation          , Model.Organisation         >().PreserveReferences();
            CreateMap<OrganisationalSubUnit , Model.OrganisationalSubUnit>().PreserveReferences();
            CreateMap<Branch                , Model.Branch               >().PreserveReferences();
            CreateMap<LegalEntity           , Model.LegalEntity          >().PreserveReferences();
            CreateMap<Role                  , Model.Role                 >().PreserveReferences();
        }
    }
}
