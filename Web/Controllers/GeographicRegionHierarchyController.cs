using AutoMapper;
using Locations;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/geographicregionhierarchies")]
    [ApiController]
    public class GeographicRegionHierarchyController: DomainObjectController<Guid, GeographicRegionHierarchy, Model.GeographicRegionHierarchy>
    {
        public GeographicRegionHierarchyController(
            IDomainObjectService<Guid, GeographicRegionHierarchy> service,
            IMapper mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}
