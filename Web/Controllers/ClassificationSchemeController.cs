using AutoMapper;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/configurationschemes")]
    [ApiController]
    public class ClassificationSchemeController: DomainObjectController<Guid, ClassificationScheme, Model.ClassificationScheme>
    {
        public ClassificationSchemeController(
            IDomainObjectService<Guid, ClassificationScheme> service,
            IMapper                                          mapper
            ) : base(
                service,
                mapper)
        {
        }
    }
}
