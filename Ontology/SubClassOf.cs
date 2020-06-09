namespace Ontology
{
    public class SubClassOf:
        Annotated,
        ISubClassOf
    {
        private IClassExpression _subClassExpression;
        private IClassExpression _superClassExpression;

        public SubClassOf(
            IClassExpression subClassExpression,
            IClassExpression superClassExpression
            ): base()
        {
            _subClassExpression   = subClassExpression;
            _superClassExpression = superClassExpression;
            _subClassExpression.SuperClasses.Add(this);
        }

        IClassExpression ISubClassOf.SubClassExpression => _subClassExpression;

        IClassExpression ISubClassOf.SuperClassExpression => _superClassExpression;
    }
}
