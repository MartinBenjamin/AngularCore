namespace Ontology
{
    public class AnnotationProperty:
        Entity,
        IAnnotationProperty
    {
        public AnnotationProperty(
            IOntology ontology,
            string    localName
            ) : base(
                ontology,
                localName)
        {
        }
    }
}
