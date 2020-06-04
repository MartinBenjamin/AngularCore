using System.Collections.Generic;

namespace Ontology
{
    public interface IAxiom
    {
        IList<IAnnotation> Annotations { get; }
    }
}
