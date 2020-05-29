using System;
using System.Collections.Generic;
using System.Text;

namespace Ontology
{
    public interface IDataAllValuesFrom: IClassExpression
    {
        IDataPropertyExpression DataPropertyExpression { get; }
        IDataRange              DataRange              { get; }
    }
}
