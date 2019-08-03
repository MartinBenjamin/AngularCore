using System.Collections.Generic;
using System.Linq;

namespace Test
{
    public static class StringExtensions
    {
        public static IEnumerable<string> Fragments(
            this string s
            )
        {
            return
                from startIndex in Enumerable.Range(0, s.Length)
                from length in Enumerable.Range(1, s.Length - startIndex)
                select s.Substring(
                    startIndex,
                    length);
        }
    }
}
