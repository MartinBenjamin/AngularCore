using System.Collections.Generic;

namespace Ontology
{
    public abstract class Annotated: IAnnotated
    {
        private readonly IList<IAnnotation> _annotations = new List<IAnnotation>();

        protected Annotated()
        {
        }

        IList<IAnnotation> IAnnotated.Annotations => _annotations;
    }
}
