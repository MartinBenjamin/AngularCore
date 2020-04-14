using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Organisations;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/branches")]
    [ApiController]
    public class BranchController: NamedController<Guid, Branch, NamedFilters, Model.Branch, NamedFilters>
    {
        public BranchController(
            INamedService<Guid, Branch, NamedFilters> service,
            IMapper                                   mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}
