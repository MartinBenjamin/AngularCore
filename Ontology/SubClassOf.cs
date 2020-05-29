namespace Ontology
{
    public class SubClassOf: ISubClassOf
    {
        private IClassExpression _subClassExpression;
        private IClassExpression _superClassExpression;

        public SubClassOf(
            IClassExpression subClassExpression,
            IClassExpression superClassExpression
            )
        {
            _subClassExpression   = subClassExpression;
            _superClassExpression = superClassExpression;
        }

        IClassExpression ISubClassOf.SubClassExpression => _subClassExpression;

        IClassExpression ISubClassOf.SuperClassExpression => _superClassExpression;

        bool ISubClassOf.Validate(
            object individual
            )
        {
            return
                !_subClassExpression.HasMember(individual) ||
                _superClassExpression.HasMember(individual);
        }
    }
}
