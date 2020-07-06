﻿using System;
using System.Collections.Generic;
using System.Linq;

namespace Web.Model
{
    public class DomainObject<TId>
    {
        public TId Id { get; set; }
    }

    public static class DomainObjectExtensions
    {
        public static Func<TDomainObject, TDomainObjectModel> ToMap<TDomainObject, TDomainObjectModel>(
            this IEnumerable<TDomainObject> domainObjects,
            IEnumerable<TDomainObjectModel> domainObjectModels
            )
            where TDomainObject     : CommonDomainObjects.DomainObject<Guid>
            where TDomainObjectModel: DomainObject<Guid>
        {
            var map = (
                from domainObject      in domainObjects
                join domainObjectModel in domainObjectModels
                on domainObject.Id equals domainObjectModel.Id
                select
                (
                    domainObject,
                    domainObjectModel
                )).ToDictionary(
                    tuple => tuple.domainObject,
                    tuple => tuple.domainObjectModel);
            return domainObject => domainObject != null ? map[domainObject] : null;
        }
    }
}
