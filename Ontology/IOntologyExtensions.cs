using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;
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

        public static IClass DomainObjectClass(
            this IOntology ontology,
            string         className
            ) => new DomainObjectClass(
                ontology,
                className);

        public static IClass DomainObjectClass<T>(
            this IOntology ontology
            ) where T: DomainObject => ontology.DomainObjectClass(typeof(T).FullName);

        public static IObjectPropertyExpression ObjectProperty<T, TProperty>(
            this IClass                                 domain,
            IClassExpression                            range,
            Expression<Func<T, IEnumerable<TProperty>>> property
            ) => new ObjectProperty<T, TProperty>(
                domain.Ontology,
                domain,
                range,
                property);

        public static IFunctionalObjectPropertyExpression ObjectProperty<T, TProperty>(
            this IClass                    domain,
            IClassExpression               range,
            Expression<Func<T, TProperty>> property
            ) => new FunctionalObjectProperty<T, TProperty>(
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

        public static IFunctionalDataPropertyExpression DataProperty<T, TProperty>(
            this IClass                    @class,
            Expression<Func<T, TProperty>> property
            ) => new FunctionalDataProperty<T, TProperty>(
                @class.Ontology,
                @class,
                property);

        public static IHasKey HasKey(
            this IClassExpression                      classExpression,
            params IFunctionalDataPropertyExpression[] dataPropertyExpressions
            ) => new HasKey(
                classExpression,
                dataPropertyExpressions);

        public static ISubClassOf SubClassOf(
            this IClassExpression subClassExpression,
            IClassExpression      superClassExpression
            ) => new SubClassOf(
                subClassExpression,
                superClassExpression);

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

        public static IDictionary<object, HashSet<IClassExpression>> Classify(
            this IOntology ontology,
            object         individual
            )
        {
            IDictionary<object, HashSet<IClassExpression>> classExpressions = new Dictionary<object, HashSet<IClassExpression>>();
            ontology.Classify(
                classExpressions,
                individual);
            return classExpressions;
        }

        public static void Classify(
            this IOntology                                 ontology,
            IDictionary<object, HashSet<IClassExpression>> classExpressions,
            object                                         individual
            )
        {
            if(classExpressions.ContainsKey(individual))
                return;

            classExpressions[individual] = new HashSet<IClassExpression>();

            foreach(var @class in ontology.Classes.Values.Where(c => c.HasMember(individual)))
                ontology.Classify(
                    classExpressions,
                    individual,
                    @class);
        }

        public static void Classify(
            this IOntology                                 ontology,
            IDictionary<object, HashSet<IClassExpression>> classExpressions,
            object                                         individual,
            IClassExpression                               classExpression
            )
        {
            if(!classExpressions[individual].Add(classExpression))
                // Class Expression already processed.
                return;

            foreach(var superClassExpression in classExpression.SuperClasses.Select(superClass => superClass.SuperClassExpression))
                ontology.Classify(
                    classExpressions,
                    individual,
                    superClassExpression);

            if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                foreach(var componentClassExpression in objectIntersectionOf.ClassExpressions)
                    ontology.Classify(
                        classExpressions,
                        individual,
                        componentClassExpression);

            foreach(var objectPropertyExpression in classExpression.ObjectProperties)
                foreach(object value in objectPropertyExpression.Values(individual))
                    ontology.Classify(
                        classExpressions,
                        value);
        }

        public static HashSet<IClassExpression> SuperClasses(
            this IClassExpression classExpression
            )
        {
            var superClassExpressions = new HashSet<IClassExpression>();
            classExpression.SuperClasses(superClassExpressions);
            return superClassExpressions;
        }

        public static void SuperClasses(
            this IClassExpression     classExpression,
            HashSet<IClassExpression> superClassExpressions
            )
        {
            if(!superClassExpressions.Add(classExpression))
                // Class Expression already processed.
                return;

            foreach(var superClassExpression in classExpression.SuperClasses.Select(superClass => superClass.SuperClassExpression))
                superClassExpression.SuperClasses(superClassExpressions);

            if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                foreach(var componentClassExpression in objectIntersectionOf.ClassExpressions)
                    componentClassExpression.SuperClasses(superClassExpressions);
        }
    }
}
