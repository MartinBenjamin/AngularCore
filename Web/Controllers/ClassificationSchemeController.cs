using AutoMapper;
using CommonDomainObjects;
using Microsoft.AspNetCore.Mvc;
using Service;
using System;

namespace Web.Controllers
{
    [Route("api/classificationschemes")]
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
