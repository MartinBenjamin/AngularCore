namespace Ontology
{
    public class Nothing: Class
    {
        internal Nothing(
            IOntology ontology
            ) : base(
                ontology,
                "Nothing")
        {
        }

        public override bool HasMember(
            object individual
            )
        {
            return false;
        }
    }
}
