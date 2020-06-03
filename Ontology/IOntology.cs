using System;
using System.Collections.Generic;
using System.Text;

namespace Ontology
{
    public interface IOntology
    {
        IClassExpression Thing   { get; }
        IClassExpression Nothing { get; }

        IDictionary<string, IClass> Classes { get; }
    }
}
