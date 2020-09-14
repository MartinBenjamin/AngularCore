﻿using System.Collections.Generic;

namespace Ontology
{
    public interface IClassExpression
    {
        IList<ISubClassOf> SuperClasses { get; }
        IList<IHasKey>     Keys         { get; }

        bool HasMember(
            IDictionary<object, HashSet<IClassExpression>>
                   classification,
            object individual);
    }
}
