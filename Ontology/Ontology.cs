﻿using CommonDomainObjects;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Ontology
{
    public class Ontology: IOntology
    {
        private string           _iri;
        private IList<IOntology> _imports;
        private IList<IAxiom>    _axioms  = new List<IAxiom>();
        private IDictionary<IClassExpression, HashSet<IClassExpression>>
                                 _superClasses = new Dictionary<IClassExpression, HashSet<IClassExpression>>();

        public static readonly IClass    Thing    = new Thing();
        public static readonly IClass    Nothing  = new Nothing();
        public static readonly IDatatype DateTime = new Datatype<DateTime>("xsd:dateTime");

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

        IDatatype IOntology.DateTime => DateTime;

        public IEnumerable<IOntology> GetOntologies()
            => _imports
                .SelectMany(import => import.GetOntologies())
                .Append(this)
                .Distinct();

        public IEnumerable<TAxiom> Get<TAxiom>() where TAxiom: IAxiom
            => GetOntologies()
                .SelectMany(import => import.Axioms)
                .OfType<TAxiom>();

        public IEnumerable<ISubClassOf> GetSuperClasses(
            IClassExpression classExpression
            ) => Get<ISubClassOf>()
                .Where(subClassOf => subClassOf.SubClassExpression == classExpression);

        public HashSet<IClassExpression> SuperClasses(
            IClassExpression classExpression
            )
        {
            HashSet<IClassExpression> superClassExpressions;
            if(!_superClasses.TryGetValue(
                classExpression,
                out superClassExpressions))
            {
                superClassExpressions = new HashSet<IClassExpression>();
                _superClasses[classExpression] = superClassExpressions;
                superClassExpressions.Add(classExpression);

                foreach(var superClassExpression in GetSuperClasses(classExpression).Select(superClass => superClass.SuperClassExpression))
                    superClassExpressions.UnionWith(SuperClasses(superClassExpression));

                if(classExpression is IObjectIntersectionOf objectIntersectionOf)
                    foreach(var componentClassExpression in objectIntersectionOf.ClassExpressions)
                        superClassExpressions.UnionWith(SuperClasses(componentClassExpression));
            }
            return superClassExpressions;
        }
    }
}
