using AutoMapper;
using LegalEntities;
using Service;
using System;

namespace Web.Controllers
{
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
