﻿using System.Collections.Generic;

namespace Ontology
{
    public class EquivalentClasses:
        Axiom,
        IEquivalentClasses
    {
        private IList<IClassExpression> _classExpressions;

        public EquivalentClasses(
            params IClassExpression[] classExpressions
            ) : base()
        {
            _classExpressions = classExpressions;
        }

        IList<IClassExpression> IEquivalentClasses.ClassExpressions => _classExpressions;
    }
}