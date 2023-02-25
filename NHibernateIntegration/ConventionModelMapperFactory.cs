using NHibernate.Mapping.ByCode;
using System;
using System.Collections.Generic;

namespace NHibernateIntegration
{
    public class ConventionModelMapperFactory: IModelMapperFactory
    {
        private IEnumerable<Action<ConventionModelMapper>> _customisers;

        public ConventionModelMapperFactory(
            IEnumerable<Action<ConventionModelMapper>> customisers
            )
        {
            _customisers = customisers;
        }

        ModelMapper IModelMapperFactory.Build()
        {
            ConventionModelMapper mapper = new ConventionModelMapper();
            foreach(var customiser in _customisers)
                customiser(mapper);
            return mapper;
        }
    }
}
