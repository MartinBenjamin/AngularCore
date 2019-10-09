using AutoMapper;
using Iso4217;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace Web.Controllers
{
    [Route("api/currencies")]
    [ApiController]
    public class CurrencyController : NamedController<string, Currency, NamedFilters, string, Model.Currency, NamedFilters>
    {
        public CurrencyController(
            INamedService<string, Currency, NamedFilters> service,
            IMapper                                       mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}