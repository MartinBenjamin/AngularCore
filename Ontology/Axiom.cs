using System.Collections.Generic;

namespace Ontology
{
    public abstract class Axiom: IAxiom
    {
        private IList<IAnnotation> _annotations = new List<IAnnotation>();

        protected Axiom()
        {
        }

        IList<IAnnotation> IAxiom.Annotations => _annotations;
    }
}
