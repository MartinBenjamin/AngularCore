namespace Ontology
{
    public class Annotation:
        Annotated,
        IAnnotation
    {
        private readonly IAnnotationProperty _property;
        private readonly object              _value;

        public Annotation(
            IAnnotationProperty property,
            object              value
            ) : base()
        {
            _property = property;
            _value    = value;
        }

        IAnnotationProperty IAnnotation.Property => _property;

        object IAnnotation.Value => _value;
    }
}
