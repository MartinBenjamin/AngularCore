using System.Collections.Generic;

namespace Ontology
{
    public class Ontology: IOntology
    {
        private IDictionary<string, IClass> _classes = new Dictionary<string, IClass>();
        private IClass _thing;
        private IClass _nothing;

        public Ontology()
        {
            _thing   = new Thing(this);
            _nothing = new Nothing(this);
        }

        IClassExpression IOntology.Thing => _thing;

        IClassExpression IOntology.Nothing => _nothing;

        IDictionary<string, IClass> IOntology.Classes => _classes;
    }
}
