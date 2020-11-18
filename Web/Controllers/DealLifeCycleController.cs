using AutoMapper;
using LifeCycles;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Web.Controllers
{
    [Route("api/deallifecycles")]
    [ApiController]
    public class DealLifeCycleController: DomainObjectController<Guid, LifeCycle, Model.LifeCycle>
    {
        private IDealLifeCycleService _service;
        private IMapper               _mapper;

        public DealLifeCycleController(
            IDealLifeCycleService service,
            IMapper               mapper
            ) : base(
                service,
                mapper)
        {
            _service = service;
            _mapper  = mapper;
        }

        [HttpGet("{id}/phase/{phaseId}")]
        public async Task<IActionResult> GetStagesAsync(
            Guid id,
            Guid phaseId
            )
        {
            var result = await _service.GetStagesAsync(
                id,
                phaseId);
            return Ok(_mapper.Map<IEnumerable<Model.LifeCycleStage>>(result));
        }
    }
}
