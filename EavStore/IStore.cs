using System;
using System.Collections.Generic;
using System.Text;

namespace EavStore
{
    public interface IStore
    {
        IDictionary<long, long> Assert(Entity entity, String attribute, Value value);
    }
}
