namespace Ontology
{
    public interface IAnnotation
    {
        IAnnotationProperty Property { get; }

        object              Value    { get; }
    }
}
