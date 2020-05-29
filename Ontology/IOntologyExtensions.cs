using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Ontology
{
    public static class IOntologyExtensions
    {
        public static IClass Class<T>(
            this IOntology ontology
            ) => new Class<T>(ontology);

        public static IObjectPropertyExpression ObjectProperty<T, TProperty>(
            this IClass                                 domain,
            IClassExpression                            range,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) => new ObjectProperty<T, TProperty>(
                domain.Ontology,
                domain,
                range,
                property);

        public static IObjectPropertyExpression ObjectProperty<T, TProperty>(
            this IClass                    domain,
            IClassExpression               range,
            Expression<Func<T, TProperty>> property
            ) => new ObjectProperty<T, TProperty>(
                domain.Ontology,
                domain,
                range,
                property);

        public static IDataPropertyExpression DataProperty<T, TProperty>(
            this IClass                                 domain,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) => new DataProperty<T, TProperty>(
                domain.Ontology,
                domain,
                property);

        public static IDataPropertyExpression DataProperty<T, TProperty>(
            this IClass                    @class,
            Expression<Func<T, TProperty>> property
            ) => new DataProperty<T, TProperty>(
                @class.Ontology,
                @class,
                property);
    }
}
