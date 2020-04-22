using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Roles;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/roles")]
    [ApiController]
    public class RoleController: NamedController<Guid, Role, NamedFilters, Model.Role, NamedFilters>
    {
        public RoleController(
            INamedService<Guid, Role, NamedFilters> service,
            IMapper                                 mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}