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

        public static IHasKey HasKey(
            this IClassExpression            classExpression,
            params IDataPropertyExpression[] dataPropertyExpressions
            ) => new HasKey(
                classExpression,
                dataPropertyExpressions);

        public static IObjectMinCardinality MinCardinality(
            this IObjectPropertyExpression objectPropertyExpression,
            int                            cardinality,
            IClassExpression               classExpression = null
            ) => new ObjectMinCardinality(
                objectPropertyExpression,
                cardinality,
                classExpression);

        public static IObjectMaxCardinality MaxCardinality(
            this IObjectPropertyExpression objectPropertyExpression,
            int                            cardinality,
            IClassExpression               classExpression = null
            ) => new ObjectMaxCardinality(
                objectPropertyExpression,
                cardinality,
                classExpression);

        public static IObjectExactCardinality ExactCardinality(
            this IObjectPropertyExpression objectPropertyExpression,
            int                            cardinality,
            IClassExpression               classExpression = null
            ) => new ObjectExactCardinality(
                objectPropertyExpression,
                cardinality,
                classExpression);

        public static IDataMinCardinality MinCardinality(
            this IDataPropertyExpression dataPropertyExpression,
            int                          cardinality,
            IDataRange                   dataRange = null
            ) => new DataMinCardinality(
                dataPropertyExpression,
                cardinality,
                dataRange);

        public static IDataMaxCardinality MaxCardinality(
            this IDataPropertyExpression dataPropertyExpression,
            int                          cardinality,
            IDataRange                   dataRange = null
            ) => new DataMaxCardinality(
                dataPropertyExpression,
                cardinality,
                dataRange);

        public static IDataExactCardinality ExactCardinality(
            this IDataPropertyExpression dataPropertyExpression,
            int                          cardinality,
            IDataRange                   dataRange = null
            ) => new DataExactCardinality(
                dataPropertyExpression,
                cardinality,
                dataRange);
    }
}
