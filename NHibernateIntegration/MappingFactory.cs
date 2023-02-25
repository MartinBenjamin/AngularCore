using NHibernate.Cfg.MappingSchema;
using NHibernate.Mapping.ByCode;
using System;
using System.Collections.Generic;

namespace NHibernateIntegration
{
    public class MappingFactory: IMappingFactory
    {
        private ModelMapper _modelMapper;
        private IList<Type> _types;
        private bool        _autoImport;

        public MappingFactory(
            ModelMapper modelMapper,
            IList<Type> types,
            bool        autoImport = true
            )
        {
            _modelMapper = modelMapper;
            _types       = types;
            _autoImport  = autoImport;
        }

        HbmMapping IMappingFactory.Build()
        {
            var mapping = _modelMapper.CompileMappingFor(_types);
            mapping.autoimport = _autoImport;
            return mapping;
        }
    }
}
