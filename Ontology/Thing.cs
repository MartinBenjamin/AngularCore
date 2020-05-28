namespace Ontology
{
    public class Thing: Class
    {
        internal Thing(
            IOntology ontology
            ) : base(
                ontology,
                "Thing")
        {
        }

        public override bool HasMember(
            object individual
            )
        {
            return true;
        }
    }
}
