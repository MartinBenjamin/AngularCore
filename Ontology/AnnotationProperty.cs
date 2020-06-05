namespace Ontology
{
    public class AnnotationProperty:
        Entity,
        IAnnotationProperty
    {
        public AnnotationProperty(
            IOntology ontology,
            string    name
            ) : base(
                ontology,
                name)
        {
        }
    }
}
