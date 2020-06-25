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

        //public static IClass DomainObjectClass(
        //    this IOntology ontology,
        //    string         className
        //    ) => new DomainObjectClass(
        //        ontology,
        //        className);

        public static IClass Class<T>(
            this IOntology ontology
            ) where T: DomainObject => ontology.Class(typeof(T).FullName);

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

            switch(individual)
            {
                case INamedIndividual namedIndividual:
                    foreach(var @class in namedIndividual.Classes.Select(classAssertion => classAssertion.ClassExpression))
                        ontology.Classify(
                            classExpressions,
                            individual,
                            @class);
                    break;
                case IIndividual iindividual:
                    if(ontology.Classes.TryGetValue(iindividual.ClassName, out var @class1))
                        ontology.Classify(
                            classExpressions,
                            individual,
                            @class1);

                    break;
                default:
                    if(ontology.Classes.TryGetValue(individual.GetType().FullName, out var @class2))
                        ontology.Classify(
                            classExpressions,
                            individual,
                            @class2);
                    break;
            }
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
