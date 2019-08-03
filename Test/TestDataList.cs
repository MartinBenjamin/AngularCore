using System.Collections.Generic;
using System.Linq;

namespace Test
{
    public class TestDataList<T>: List<T>
    {
        public TestDataList(
            params T[] elements
            ) : base(elements)
        {
        }

        public TestDataList(
            IEnumerable<T> collection
            ) : base(collection)
        {
        }

        public override string ToString()
        {
            return Count == 0 ?
                "[]" :
                string.Format(
                "[ {0} ]",
                this.Select(element => element.ToString())
                    .Aggregate((lhs, rhs) => lhs + ", " + rhs));
        }
    }
}
