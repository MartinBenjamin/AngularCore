namespace Ontology
{
    public class Annotation: IAnnotation
    {
        private IAnnotationProperty _property;
        private object              _value;

        public Annotation(
            IAnnotationProperty property,
            object              value
            )
        {
            _property = property;
            _value    = value;
        }

        IAnnotationProperty IAnnotation.Property => _property;

        object IAnnotation.Value => _value;
    }
}
