using CommonDomainObjects;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class Ontology: IOntology
    {
        private readonly string           _iri;
        private readonly IList<IOntology> _imports;
        private readonly IList<IAxiom>    _axioms  = new List<IAxiom>();
        private readonly IDictionary<IClassExpression, HashSet<IClassExpression>>
                                          _superClasses = new Dictionary<IClassExpression, HashSet<IClassExpression>>();

        public Ontology(
            string             iri,
            params IOntology[] imports
            )
        {
            _iri     = iri;
            _imports = imports;
        }

        string IOntology.Iri => _iri;

        IList<IOntology> IOntology.Imports => _imports;

        IList<IAxiom> IOntology.Axioms => _axioms;

        public IEnumerable<IOntology> GetOntologies()
            => _imports
                .SelectMany(import => import.GetOntologies())
                .Append(this)
                .Distinct();

        public IEnumerable<TAxiom> Get<TAxiom>() where TAxiom: IAxiom
            => GetOntologies()
                .SelectMany(import => import.Axioms)
                .OfType<TAxiom>();

        public HashSet<IClassExpression> SuperClasses(
            IClassExpression classExpression
            )
        {
            if(!_superClasses.TryGetValue(
                classExpression,
                out HashSet<IClassExpression> superClassExpressions))
            {
                superClassExpressions = new HashSet<IClassExpression>();
                _superClasses[classExpression] = superClassExpressions;
                superClassExpressions.Add(classExpression);

                Get<ISubClassOf>()
                    .Where(subClassOf => subClassOf.SubClassExpression == classExpression)
                    .Select(subClassOf => subClassOf.SuperClassExpression)
                    .ForEach(superClassExpression => superClassExpressions.UnionWith(SuperClasses(superClassExpression)));

                if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                    objectIntersectionOf
                        .ClassExpressions
                        .ForEach(componentClassExpression => superClassExpressions.UnionWith(SuperClasses(componentClassExpression)));
            }
            return superClassExpressions;
        }
    }
}
