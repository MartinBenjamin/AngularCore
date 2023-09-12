using AutoMapper;
using Iso3166._1;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/countries")]
    [ApiController]
    public class CountryController: NamedController<Guid, Country, NamedFilters, Model.Country, NamedFilters>
    {
        public CountryController(
            INamedService<Guid, Country, NamedFilters> service,
            IMapper                                    mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}
