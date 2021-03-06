﻿using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Ontology
{
    public static class IOntologyExtensions
    {
        public static IObjectIntersectionOf Intersect(
            this IClassExpression lhs,
            IClassExpression      rhs
            ) => new ObjectIntersectionOf(lhs, rhs);

        public static IObjectIntersectionOf Intersect(
            this IObjectIntersectionOf lhs,
            IClassExpression           rhs
            )
        {
            lhs.ClassExpressions.Add(rhs);
            return lhs;
        }

        public static IObjectUnionOf Union(
            this IClassExpression lhs,
            IClassExpression      rhs
            ) => new ObjectUnionOf(lhs, rhs);

        public static IObjectUnionOf Union(
            this IObjectUnionOf lhs,
            IClassExpression    rhs
            )
        {
            lhs.ClassExpressions.Add(rhs);
            return lhs;
        }

        public static IObjectComplementOf Complement(
            this IClassExpression classExpression
            ) => new ObjectComplementOf(classExpression);

        public static IClass DeclareClass(
            this IOntology ontology,
            string         className
            ) => new Class(
                ontology,
                className);

        public static IClass DeclareClass<T>(
            this IOntology ontology
            ) => ontology.DeclareClass(typeof(T).Name);

        public static IObjectPropertyExpression DeclareObjectProperty<T, TProperty>(
            this IOntology                  ontology,
            string                          localName,
            Func<T, IEnumerable<TProperty>> property
            ) => new ObjectProperty<T, TProperty>(
                ontology,
                localName,
                property);

        public static IObjectPropertyExpression DeclareObjectProperty<T, TProperty>(
            this IOntology                              ontology,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) => ontology.DeclareObjectProperty(
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name,
                property.Compile());

        public static IObjectPropertyExpression DeclareObjectProperty<T, TProperty>(
            this IOntology     ontology,
            string             localName,
            Func<T, TProperty> property
            ) => new FunctionalObjectProperty<T, TProperty>(
                ontology,
                localName,
                property);

        public static IObjectPropertyExpression DeclareObjectProperty<T, TProperty>(
            this IOntology                 ontology,
            Expression<Func<T, TProperty>> property
            ) => ontology.DeclareObjectProperty(
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name,
                property.Compile());

        public static IDataPropertyExpression DeclareDataProperty<T, TProperty>(
            this IOntology                  ontology,
            string                          localName,
            Func<T, IEnumerable<TProperty>> property
            ) => new DataProperty<T, TProperty>(
                ontology,
                localName,
                property);

        public static IDataPropertyExpression DeclareDataProperty<T, TProperty>(
            this IOntology                              ontology,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) => ontology.DeclareDataProperty(
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name,
                property.Compile());

        public static IDataPropertyExpression DeclareDataProperty<T, TProperty>(
            this IOntology     ontology,
            string             localName,
            Func<T, TProperty> property
            ) => new FunctionalDataProperty<T, TProperty>(
                ontology,
                localName,
                property);

        public static IDataPropertyExpression DeclareDataProperty<T, TProperty>(
            this IOntology                 ontology,
            Expression<Func<T, TProperty>> property
            ) => ontology.DeclareDataProperty(
                property.Body is MemberExpression memberExpression ? memberExpression.Member.Name : typeof(TProperty).Name,
                property.Compile());

        public static IObjectPropertyExpression DeclareObjectProperty<T, TProperty>(
            this IClass                     domain,
            string                          localName,
            Func<T, IEnumerable<TProperty>> property
            )
        {
            var objectPropertyExpression = domain.Ontology.DeclareObjectProperty(
                localName,
                property);

            new ObjectPropertyDomain(
                domain.Ontology,
                objectPropertyExpression,
                domain);

            return objectPropertyExpression;
        }

        public static IObjectPropertyExpression DeclareObjectProperty<T, TProperty>(
            this IClass                                 domain,
            Expression<Func<T, IEnumerable<TProperty>>> property
            )
        {
            var objectPropertyExpression = domain.Ontology.DeclareObjectProperty(property);

            new ObjectPropertyDomain(
                domain.Ontology,
                objectPropertyExpression,
                domain);

            return objectPropertyExpression;
        }

        public static IObjectPropertyExpression DeclareObjectProperty<T, TProperty>(
            this IClass        domain,
            string             localName,
            Func<T, TProperty> property
            )
        {
            var objectPropertyExpression = domain.Ontology.DeclareObjectProperty(
                localName,
                property);

            new ObjectPropertyDomain(
                domain.Ontology,
                objectPropertyExpression,
                domain);

            return objectPropertyExpression;
        }

        public static IObjectPropertyExpression DeclareObjectProperty<T, TProperty>(
            this IClass                    domain,
            Expression<Func<T, TProperty>> property
            )
        {
            var objectPropertyExpression = domain.Ontology.DeclareObjectProperty(property);

            new ObjectPropertyDomain(
                domain.Ontology,
                objectPropertyExpression,
                domain);

            return objectPropertyExpression;
        }

        public static IDataPropertyExpression DeclareDataProperty<T, TProperty>(
            this IClass                                 domain,
            Expression<Func<T, IEnumerable<TProperty>>> property
            )
        {
            var dataPropertyExpression = domain.Ontology.DeclareDataProperty(property);

            new DataPropertyDomain(
                domain.Ontology,
                dataPropertyExpression,
                domain);

            return dataPropertyExpression;
        }

        public static IDataPropertyExpression DeclareDataProperty<T, TProperty>(
            this IClass                    domain,
            Expression<Func<T, TProperty>> property
            )
        {
            var dataPropertyExpression = domain.Ontology.DeclareDataProperty(property);

            new DataPropertyDomain(
                domain.Ontology,
                dataPropertyExpression,
                domain);

            return dataPropertyExpression;
        }

        public static INamedIndividual DeclareNamedIndividual(
            this IOntology ontology,
            string         localName
            ) => new NamedIndividual(
                ontology,
                localName);

        public static INamedIndividual DeclareNamedIndividual(
            this IClass @class,
            string      localName
            ) => ((IClassAssertion)new ClassAssertion(
                @class.Ontology,
                @class,
                new NamedIndividual(
                    @class.Ontology,
                    localName))).NamedIndividual;

        public static IDataPropertyRange Range(
            this IDataPropertyExpression dataPropertyExpression,
            IDatatype                    datatype
            ) => new DataPropertyRange(
                dataPropertyExpression.Ontology,
                dataPropertyExpression,
                datatype);

        public static IHasKey HasKey(
            this IClass                      @class,
            params IDataPropertyExpression[] dataPropertyExpressions
            ) => new HasKey(
                @class.Ontology,
                @class,
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
            ) => new EquivalentClasses(
                @class.Ontology,
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

        public static IDictionary<object, ISet<IClass>> Classify(
            this IOntology ontology,
            object         individual
            )
        {
            var classifications = new Dictionary<object, ISet<IClass>>();
            var evaluator = new ClassMembershipEvaluator(
                ontology,
                classifications);
            ontology.Classify(
                evaluator,
                individual);
            return classifications;
        }

        public static void Classify(
            this IOntology           ontology,
            ClassMembershipEvaluator evaluator,
            object                   individual
            )
        {
            (
                from @class in evaluator.Classify(individual)
                join objectPropertyDomain in ontology.Get<IObjectPropertyDomain>() on @class equals objectPropertyDomain.Domain
                from value in evaluator.ObjectPropertyValues(
                    objectPropertyDomain.ObjectPropertyExpression,
                    individual)
                select value
            ).ForEach(value => ontology.Classify(
               evaluator,
               value));
        }
    }
}
