using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace Ontology
{
    public static class IOntologyExtensions
    {
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

        public static IDictionary<object, IList<IClassExpression>> Classify(
            this IOntology ontology,
            object         individual
            )
        {
            IDictionary<object, IList<IClassExpression>> classExpressions = new Dictionary<object, IList<IClassExpression>>();
            ontology.Classify(
                classExpressions,
                individual);
            return classExpressions;
        }

        public static void Classify(
            this IOntology                               ontology,
            IDictionary<object, IList<IClassExpression>> classExpressions,
            object                                       individual
            )
        {
            if(classExpressions.ContainsKey(individual))
                return;

            classExpressions[individual] = new List<IClassExpression>();

            foreach(var @class in ontology.Classes.Values.Where(c => c.HasMember(individual)))
                ontology.Classify(
                    classExpressions,
                    individual,
                    @class);
        }

        public static void Classify(
            this IOntology                               ontology,
            IDictionary<object, IList<IClassExpression>> classes,
            object                                       individual,
            IClassExpression                             classExpression
            )
        {
            classes[individual].Add(classExpression);

            foreach(var superClassExpression in classExpression.SuperClasses.Select(superClass => superClass.SuperClassExpression))
                ontology.Classify(
                    classes,
                    individual,
                    superClassExpression);

            foreach(var objectPropertyExpression in classExpression.ObjectProperties)
                foreach(object value in objectPropertyExpression.Values(individual))
                    ontology.Classify(
                        classes,
                        value);
        }
    }
}
