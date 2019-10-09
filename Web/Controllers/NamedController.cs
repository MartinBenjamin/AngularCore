using AutoMapper;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Web.Controllers
{
    public abstract class NamedController<TId, TNamed, TNamedFilters, TIdModel, TNamedModel, TNamedFiltersModel> : ControllerBase
        where TNamed: Named<TId>
        where TNamedFilters: NamedFilters
    {
        private INamedService<TId, TNamed, TNamedFilters> _service;
        private IMapper                                   _mapper;

        protected NamedController(
            INamedService<TId, TNamed, TNamedFilters> service,
            IMapper                                   mapper
            )
        {
            _service = service;
            _mapper  = mapper;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAsync(
            TIdModel id
            )
        {
            var named = await _service.GetAsync(_mapper.Map<TId>(id));
            return named == null ? (IActionResult)NotFound() : Ok(_mapper.Map<TNamedModel>(named));
        }

        [HttpGet]
        public Action<IEnumerable<TNamedModel>> Find(
            TNamedFilters filters
            )
        {
            return null;
        }
    }
}