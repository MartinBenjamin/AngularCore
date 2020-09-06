using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Ontology
{
    public static class IOntologyExtensions
    {  
        public static IClass Class(
            this IOntology ontology,
            string         className
            ) => new Class(
                ontology,
                className);

        public static IClass Class<T>(
            this IOntology ontology
            ) => new Class<T>(ontology);

        public static IObjectPropertyExpression ObjectProperty<T, TProperty>(
            this IOntology                              ontology,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) => new ObjectProperty<T, TProperty>(
                ontology,
                property);

        public static IDataPropertyExpression DataProperty<T, TProperty>(
            this IOntology                              ontology,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) => new DataProperty<T, TProperty>(
                ontology,
                property);

        public static IObjectPropertyExpression ObjectProperty<T, TProperty>(
            this IClass                                 domain,
            Expression<Func<T, IEnumerable<TProperty>>> property
            )
        {
            var objectPropertyExpression = domain.Ontology.ObjectProperty(property);

            new ObjectPropertyDomain(
                domain.Ontology,
                objectPropertyExpression,
                domain);

            return objectPropertyExpression;
        }

        public static IObjectPropertyExpression ObjectProperty<T, TProperty>(
            this IClass                    domain,
            Expression<Func<T, TProperty>> property
            )
        {
            var objectPropertyExpression = new FunctionalObjectProperty<T, TProperty>(
                domain.Ontology,
                property);

            new ObjectPropertyDomain(
                domain.Ontology,
                objectPropertyExpression,
                domain);

            return objectPropertyExpression;
        }

        public static IDataPropertyExpression DataProperty<T, TProperty>(
            this IClass                                 domain,
            Expression<Func<T, IEnumerable<TProperty>>> property
            )
        {

            var dataPropertyExpression = domain.Ontology.DataProperty(property);

            new DataPropertyDomain(
                domain.Ontology,
                dataPropertyExpression,
                domain);

            return dataPropertyExpression;
        }

        public static IDataPropertyExpression DataProperty<T, TProperty>(
            this IClass                    domain,
            Expression<Func<T, TProperty>> property
            )
        {

            var dataPropertyExpression = new FunctionalDataProperty<T, TProperty>(
                domain.Ontology,
                property);

            new DataPropertyDomain(
                domain.Ontology,
                dataPropertyExpression,
                domain);

            return dataPropertyExpression;
        }

        public static IHasKey HasKey(
            this IClassExpression            classExpression,
            params IDataPropertyExpression[] dataPropertyExpressions
            ) => new HasKey(
                classExpression,
                dataPropertyExpressions);

        public static ISubClassOf SubClassOf(
            this IClass      subClassExpression,
            IClassExpression superClassExpression
            ) => new SubClassOf(
                subClassExpression.Ontology,
                subClassExpression,
                superClassExpression);

        public static IEquivalentClasses Define(
            this IClass      @class,
            IClassExpression definition
            ) => new ClassDefinition(
                @class,
                definition);

        public static IObjectHasValue HasValue(
            this IObjectPropertyExpression objectPropertyExpression,
            object                         individual
            ) => new ObjectHasValue(
                objectPropertyExpression,
                individual);

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

        public static INamedIndividual NamedIndividual(
            this IOntology ontology,
            string         name
            ) => new NamedIndividual(
                ontology,
                name);

        public static INamedIndividual NamedIndividual(
            this IClass classExpression,
            string      name
            ) => ((IClassAssertion)new ClassAssertion(
                classExpression.Ontology,
                classExpression,
                new NamedIndividual(
                    classExpression.Ontology,
                    name))).NamedIndividual;

        public static IObjectPropertyAssertion Value(
            this INamedIndividual     sourceIndividual,
            IObjectPropertyExpression objectPropertyExpression,
            object                    targetIndividual
            ) => new ObjectPropertyAssertion(
                sourceIndividual.Ontology,
                objectPropertyExpression,
                sourceIndividual,
                targetIndividual);

        public static IDataPropertyAssertion Value(
            this INamedIndividual   sourceIndividual,
            IDataPropertyExpression dataPropertyExpression,
            object                  targetValue
            ) => new DataPropertyAssertion(
                sourceIndividual.Ontology,
                dataPropertyExpression,
                sourceIndividual,
                targetValue);

        public static IAnnotation Annotate<TAnnotated>(
            this TAnnotated     annotated,
            IAnnotationProperty property,
            object              value
            ) where TAnnotated: IAnnotated
        {
            var annotation = new Annotation(
                property,
                value);
            annotated.Annotations.Add(annotation);
            return annotation;
        }
    }
}
