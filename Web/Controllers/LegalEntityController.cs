using AutoMapper;
using LegalEntities;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/legalentities")]
    [ApiController]
    public class LegalEntityController: NamedController<Guid, LegalEntity, NamedFilters, Model.LegalEntity, NamedFilters>
    {
        public LegalEntityController(
            INamedService<Guid, LegalEntity, NamedFilters> service,
            IMapper                                        mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}
