using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class ClassMembershipEvaluator: IClassMembershipEvaluator
    {
        private readonly IOntology                                               _ontology;
        private readonly IList<(IClass Class, IClassExpression ClassExpression)> _definitions;
        private readonly ILookup<IClassExpression, IClassExpression>             _superClassExpressions;
        private readonly ILookup<IClassExpression, IClassExpression>             _subClassExpressions;
        private readonly IDictionary<IClassExpression, IList<IClassExpression>>  _disjointClassExpressions;
        private readonly IDictionary<object, HashSet<IClassExpression>>          _classifications;

        private class ClassVisitor: ClassExpressionVisitor
        {
            private readonly Action<IClass> _action;

            public ClassVisitor(
                Action<IClass> action
                )
            {
                _action = action;
            }

            public override void Visit(
                IClass @class
                ) => _action(@class);
        }


        public ClassMembershipEvaluator(
            IOntology                                      ontology,
            IDictionary<object, HashSet<IClassExpression>> classifications
            )
        {
            _ontology              = ontology;
            _classifications       = classifications;
            _superClassExpressions = _ontology.Get<ISubClassOf>().ToLookup(
                subClassOf => subClassOf.SubClassExpression,
                subClassOf => subClassOf.SuperClassExpression);
            _subClassExpressions   = _ontology.Get<ISubClassOf>().ToLookup(
                subClassOf => subClassOf.SuperClassExpression,
                subClassOf => subClassOf.SubClassExpression);
            _definitions           = (
                from @class in _ontology.Get<IClass>()
                from equivalentClasses in _ontology.Get<IEquivalentClasses>()
                where equivalentClasses.ClassExpressions.Contains(@class)
                from classExpression in equivalentClasses.ClassExpressions
                where !(classExpression is IClass)
                group classExpression by @class into classExpressionsGroupedbyClass
                select
                (
                    classExpressionsGroupedbyClass.Key,
                    classExpressionsGroupedbyClass.First()
                )).ToList();

            var disjointPairs = (
                from disjointClasses in _ontology.Get<IDisjointClasses>()
                from ClassExpression1 in disjointClasses.ClassExpressions
                from ClassExpression2 in disjointClasses.ClassExpressions
                where ClassExpression1 != ClassExpression2
                select
                (
                    ClassExpression1,
                    ClassExpression2
                ));
            _disjointClassExpressions = (
                from disjointPair in disjointPairs
                group disjointPair.ClassExpression2 by disjointPair.ClassExpression1 into disjointGroup
                select disjointGroup
                ).ToDictionary(
                disjointGroup => disjointGroup.Key,
                disjointGroup => (IList<IClassExpression>)disjointGroup.ToList());

            foreach(var classExpression in _disjointClassExpressions.Keys)
            {
                var disjointClassExpressions = _disjointClassExpressions[classExpression];
                for(var index = 0;index < disjointClassExpressions.Count;++index)
                    _subClassExpressions[disjointClassExpressions[index]].ForEach(
                        subclassExpression => disjointClassExpressions.Add(subclassExpression));
            }

            HashSet<IClass> adjacent = null;
            var empty = new HashSet<IClass>();
            var adjacencyList = _ontology.Get<IClass>()
                .ToDictionary(
                    @class => @class,
                    @class => empty);

            var classVisitor = new ClassExpressionNavigator(new ClassVisitor(@class => adjacent.Add(@class)));

            _definitions.ForEach(
                definition =>
                {
                    adjacent = new HashSet<IClass>();
                    definition.ClassExpression.Accept(classVisitor);
                    adjacencyList[definition.Class] = adjacent;
                });

            _definitions = (
                from @class in adjacencyList.TopologicalSort()
                join definition in _definitions on @class equals definition.Class
                select definition
                ).ToList();
        }

        bool IClassMembershipEvaluator.Evaluate(
            IClass @class,
            object individual
            ) => Classify(individual).Contains(@class);

        bool IClassMembershipEvaluator.Evaluate(
            IObjectIntersectionOf objectIntersectionOf,
            object                individual
            ) => objectIntersectionOf.ClassExpressions.All(classExpression => classExpression.Evaluate(
                this,
                individual));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectUnionOf objectUnionOf,
            object         individual
            ) => objectUnionOf.ClassExpressions.Any(classExpression => classExpression.Evaluate(
                this,
                individual));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectComplementOf objectComplementOf,
            object              individual
            ) => !objectComplementOf.ClassExpression.Evaluate(
                this,
                individual);

        bool IClassMembershipEvaluator.Evaluate(
            IObjectOneOf objectOneOf,
            object       individual
            ) => objectOneOf.Individuals.Any(
                member => AreEqual(
                    individual,
                    member));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectSomeValuesFrom objectSomeValuesFrom,
            object                individual
            ) => objectSomeValuesFrom.ObjectPropertyExpression.Values(
                _ontology,
                individual).Any(
                    value => objectSomeValuesFrom.ClassExpression.Evaluate(
                        this,
                        value));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectAllValuesFrom objectAllValuesFrom,
            object               individual
            ) => objectAllValuesFrom.ObjectPropertyExpression.Values(
                _ontology,
                individual).All(
                    value => objectAllValuesFrom.ClassExpression.Evaluate(
                        this,
                        value));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectHasValue objectHasValue,
            object          individual
            ) => objectHasValue.ObjectPropertyExpression.Values(
                _ontology,
                individual).Any(
                    value => AreEqual(
                        objectHasValue.Individual,
                        value));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectHasSelf objectHasValue,
            object         individual
            ) => objectHasValue.ObjectPropertyExpression.Values(
                _ontology,
                individual).Any(
                    value => AreEqual(
                        individual,
                        value));

        bool IClassMembershipEvaluator.Evaluate(
            IObjectMinCardinality objectMinCardinality,
            object                individual
            ) => objectMinCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectMinCardinality.ClassExpression ?? ReservedVocabulary.Thing).Evaluate(
                        this,
                        value)) >= objectMinCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IObjectMaxCardinality objectMaxCardinality,
            object                individual
            ) => objectMaxCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectMaxCardinality.ClassExpression ?? ReservedVocabulary.Thing).Evaluate(
                        this,
                        value)) <= objectMaxCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IObjectExactCardinality objectExactCardinality,
            object                  individual
            ) => objectExactCardinality.ObjectPropertyExpression.Values(
                _ontology,
                individual).Count(
                    value => (objectExactCardinality.ClassExpression ?? ReservedVocabulary.Thing).Evaluate(
                        this,
                        value)) == objectExactCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IDataSomeValuesFrom dataSomeValuesFrom,
            object              individual
            ) => dataSomeValuesFrom.DataPropertyExpression.Values(
                _ontology,
                individual).Any(dataSomeValuesFrom.DataRange.HasMember);

        bool IClassMembershipEvaluator.Evaluate(
            IDataAllValuesFrom dataAllValuesFrom,
            object             individual
            ) => dataAllValuesFrom.DataPropertyExpression.Values(
                _ontology,
                individual).All(dataAllValuesFrom.DataRange.HasMember);

        bool IClassMembershipEvaluator.Evaluate(
            IDataHasValue dataHasValue,
            object        individual
            ) => dataHasValue.DataPropertyExpression.Values(
                _ontology,
                individual).Contains(dataHasValue.Value);

        bool IClassMembershipEvaluator.Evaluate(
            IDataMinCardinality dataMinCardinality,
            object              individual
            ) => dataMinCardinality.DataPropertyExpression.Values(
                _ontology,
                individual).Count(value => dataMinCardinality.DataRange?.HasMember(value) ?? true) >= dataMinCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IDataMaxCardinality dataMaxCardinality,
            object              individual
            ) => dataMaxCardinality.DataPropertyExpression.Values(
                _ontology,
                individual).Count(value => dataMaxCardinality.DataRange?.HasMember(value) ?? true) <= dataMaxCardinality.Cardinality;

        bool IClassMembershipEvaluator.Evaluate(
            IDataExactCardinality dataExactCardinality,
            object                individual
            ) => dataExactCardinality.DataPropertyExpression.Values(
                _ontology,
                individual).Count(value => dataExactCardinality.DataRange?.HasMember(value) ?? true) == dataExactCardinality.Cardinality;

        private bool AreEqual(
            object lhs,
            object rhs
            )
        {
            var commonClassExpressions = Classify(lhs);
            commonClassExpressions.IntersectWith(Classify(rhs));
            var hasKeys =
                from commonClassExpression in commonClassExpressions
                join hasKey in _ontology.Get<IHasKey>() on commonClassExpression equals hasKey.ClassExpression
                select hasKey;
            return
                hasKeys.Any() &&
                hasKeys.All(hasKey => hasKey.AreEqual(
                    _ontology,
                    lhs,
                    rhs));
        }

        public HashSet<IClassExpression> Classify(
            object individual
            )
        {
            if(_classifications.TryGetValue(
                individual,
                out HashSet<IClassExpression> classExpressions))
                return classExpressions;

            _classifications[individual] =
            classExpressions = new HashSet<IClassExpression>();

            switch(individual)
            {
                case INamedIndividual namedIndividual:
                    _ontology.Get<IClassAssertion>()
                        .Where(classAssertion => classAssertion.NamedIndividual == namedIndividual)
                        .Select(classAssertion => classAssertion.ClassExpression)
                        .ForEach(classExpression => Classify(
                            classExpressions,
                            individual,
                            classExpression));
                    break;
                case IIndividual iindividual:
                    _ontology.Get<IClass>()
                        .Where(@class => @class.Iri == iindividual.ClassIri)
                        .ForEach(@class => Classify(
                            classExpressions,
                            individual,
                            @class));
                    break;
                default:
                    (
                        from @class in _ontology.Get<IClass>()
                        from type in individual.GetTypes()
                        where @class.Iri == type.FullName
                        select @class
                    ).ForEach(@class => Classify(
                        classExpressions,
                        individual,
                        @class));
                    break;
            }

            var disjointClasses = (
                from classExpression in classExpressions
                join pair in _disjointClassExpressions on classExpression equals pair.Key
                from disjointClassExpression in pair.Value
                where disjointClassExpression is IClass
                select (IClass)disjointClassExpression
                ).ToList();

            var candidates = _definitions
                .Where(definition => !disjointClasses.Contains(definition.Class))
                .ToList();

            (
                from definition in candidates
                where
                    definition.ClassExpression.Evaluate(
                        this,
                        individual)
                select definition.Class
            ).ForEach(@class => Classify(
                classExpressions,
                individual,
                @class));

            return classExpressions;
        }

        private void Classify(
            HashSet<IClassExpression> classExpressions,
            object                    individual,
            IClassExpression          classExpression
            )
        {
            if(!classExpressions.Add(classExpression))
                // Class Expression already processed.
                return;

            _superClassExpressions[classExpression].ForEach(superClassExpression => Classify(
                    classExpressions,
                    individual,
                    superClassExpression));

            if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                objectIntersectionOf.ClassExpressions
                    .ForEach(componentClassExpression => Classify(
                        classExpressions,
                        individual,
                        componentClassExpression));
        }
    }
}
