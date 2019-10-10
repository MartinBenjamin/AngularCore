using AutoMapper;
using Iso3166._1;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace Web.Controllers
{
    [Route("api/countries")]
    [ApiController]
    public class CountryController: NamedController<string, Country, NamedFilters, Model.Country, NamedFilters>
    {
        public CountryController(
            INamedService<string, Country, NamedFilters> service,
            IMapper                                      mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}
