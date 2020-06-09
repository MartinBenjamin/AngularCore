using System.Collections.Generic;

namespace Ontology
{
    public interface IAnnotated
    {
        IList<IAnnotation> Annotations { get; }
    }
}
