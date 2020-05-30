using System.Linq;

namespace Ontology
{
    public class ObjectHasValue:
        ObjectPropertyRestriction,
        IObjectHasValue
    {
        private object _individual;
        public ObjectHasValue(
            IObjectPropertyExpression objectPropertyExpression,
            object                    individual
            ) : base(objectPropertyExpression)
        {
            _individual = individual;
        }

        object IObjectHasValue.Individual => _individual;

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
