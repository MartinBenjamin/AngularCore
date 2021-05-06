using AutoMapper;
using FacilityAgreements;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/facilityfeetypes")]
    [ApiController]
    public class FacilityFeeTypeController: NamedController<Guid, FacilityFeeType, NamedFilters, Model.FacilityFeeType, NamedFilters>
    {
        public FacilityFeeTypeController(
            INamedService<Guid, FacilityFeeType, NamedFilters> service,
            IMapper                                            mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}