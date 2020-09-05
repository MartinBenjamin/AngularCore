using System.Collections.Generic;

namespace Ontology
{
    public class EquivalentClasses:
        Axiom,
        IEquivalentClasses
    {
        private IList<IClassExpression> _classExpressions;

        public EquivalentClasses(
            IOntology                 ontology,
            params IClassExpression[] classExpressions
            ) : base(ontology)
        {
            _classExpressions = classExpressions;
        }

        IEnumerable<IClassExpression> IEquivalentClasses.ClassExpressions => _classExpressions;
    }

    public class ClassDefinition:
        Axiom,
        IEquivalentClasses
    {
        private IClass           _class;
        private IClassExpression _definition;

        public ClassDefinition(
            IClass           @class,
            IClassExpression definition
            ) : base(@class.Ontology)
        {
            _class      = @class;
            _definition = definition;
            _class.Definition = _definition;
        }

        IEnumerable<IClassExpression> IEquivalentClasses.ClassExpressions
        {
            get
            {
                yield return _class;
                yield return _definition;
            }
        }
    }
}
