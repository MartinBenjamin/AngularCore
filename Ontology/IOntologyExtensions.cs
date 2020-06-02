using System;
using System.Collections.Generic;
using System.Linq;
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

        public static IDictionary<object, IList<IClass>> Classify(
            this IOntology ontology,
            object         individual
            )
        {
            IDictionary<object, IList<IClass>> classes = new Dictionary<object, IList<IClass>>();
            ontology.Classify(
                classes,
                individual);
            return classes;
        }

        public static void Classify(
            this IOntology                     ontology,
            IDictionary<object, IList<IClass>> classes,
            object                             individual
            )
        {
            if(classes.ContainsKey(individual))
                return;

            classes[individual] = new List<IClass>();

            foreach(var @class in ontology.Classes.Values.Where(c => c.HasMember(individual)))
                ontology.Classify(
                    classes,
                    individual,
                    @class);
        }

        public static void Classify(
            this IOntology                     ontology,
            IDictionary<object, IList<IClass>> classes,
            object                             individual,
            IClass                             @class
            )
        {
            classes[individual].Add(@class);

            foreach(var superClass in @class.SuperClasses.Select(superClass => superClass.SuperClassExpression).OfType<IClass>())
                ontology.Classify(
                    classes,
                    individual,
                    superClass);

            foreach(var objectPropertyExpression in @class.ObjectProperties)
                foreach(object o in objectPropertyExpression.Values(individual))
                    ontology.Classify(
                        classes,
                        o);
        }
    }
}
