﻿using AutoMapper;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using Service;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Web.Controllers
{
    public abstract class NamedController<TId, TNamed, TNamedFilters, TNamedModel, TNamedFiltersModel> : ControllerBase
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
            TId id
            )
        {
            var named = await _service.GetAsync(id);
            return named == null ? (IActionResult)NotFound() : Ok(_mapper.Map<TNamedModel>(named));
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