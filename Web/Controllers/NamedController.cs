using AutoMapper;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using Service;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Web.Controllers
{
    public abstract class NamedController<TId, TNamed, TNamedFilters, TNamedModel, TNamedFiltersModel> :
        DomainObjectController<TId, TNamed, TNamedModel>
        where TNamed: Named<TId>
        where TNamedFilters: NamedFilters
    {
        private INamedService<TId, TNamed, TNamedFilters> _service;
        private IMapper                                   _mapper;

        protected NamedController(
            INamedService<TId, TNamed, TNamedFilters> service,
            IMapper                                   mapper
            ) : base(
                service,
                mapper)
        {
            _service = service;
            _mapper  = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> FindAsync(
            [FromQuery]
            TNamedFilters filters
            )
        {
            var result = await _service.FindAsync(_mapper.Map<TNamedFilters>(filters));
            return Ok(_mapper.Map<IEnumerable<TNamedModel>>(result));
        }
    }
}