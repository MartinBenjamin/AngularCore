using System;
using System.Collections.Generic;
using System.Text;

namespace Ontology
{
    // An instance (individual) is a member of zero or more classes.
    // An instance (individual) has at most one asserted class identified by the full name of its C# Type.
    public interface IOntology
    {
        IClassExpression Thing   { get; }
        IClassExpression Nothing { get; }

        IDictionary<string, IClass> Classes { get; }
    }
}
