namespace Ontology
{
    public interface IAnnotation: IAnnotated
    {
        IAnnotationProperty Property { get; }

        object              Value    { get; }
    }
}
