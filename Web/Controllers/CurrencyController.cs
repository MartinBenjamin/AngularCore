using AutoMapper;
using Iso4217;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/currencies")]
    [ApiController]
    public class CurrencyController : NamedController<Guid, Currency, NamedFilters, Model.Currency, NamedFilters>
    {
        public CurrencyController(
            INamedService<Guid, Currency, NamedFilters> service,
            IMapper                                     mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}