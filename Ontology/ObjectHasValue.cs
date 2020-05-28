using System.Linq;

namespace Ontology
{
    public class ObjectHasValue:
        ClassExpression,
        IObjectHasValue
    {
        private IObjectPropertyExpression _objectPropertyExpression;
        private object                    _individual;

        IObjectPropertyExpression IObjectHasValue.ObjectPropertyExpression => _objectPropertyExpression;

        object IObjectHasValue.Individual => _individual;

        public ObjectHasValue(
            IObjectPropertyExpression objectPropertyExpression,
            object                    individual
            )
        {
            _objectPropertyExpression = objectPropertyExpression;
            _individual               = individual;
        }

        public override bool HasMember(
            object individual
            )
        {
            var hasKey = _objectPropertyExpression.Ontology.Classes[individual.GetType().FullName].Keys.FirstOrDefault();
            return
                hasKey != null &&
                _objectPropertyExpression.Values(individual).Any(i => _individual.GetType() == i.GetType() && hasKey.AreEqual(_individual, i));
        }
    }
}
