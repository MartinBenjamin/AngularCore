using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public static class EnumerableExtensions
    {
        public static IEnumerable<IList<T>> Permute<T>(
            this IEnumerable<T> enumerable
            )
        {
            var permutation = enumerable.ToList();

            var c = Enumerable.Repeat(
                0,
                permutation.Count).ToList();

            yield return new List<T>(permutation);

            var index = 0;
            while(index < permutation.Count)
                if(c[index] < index)
                {
                    if(index % 2 == 0)
                    {
                        var temp = permutation[0];
                        permutation[0] = permutation[index];
                        permutation[index] = temp;
                    }
                    else
                    {
                        var temp = permutation[c[index]];
                        permutation[c[index]] = permutation[index];
                        permutation[index] = temp;
                    }

                    c[index] += 1;
                    index = 0;

                    yield return new List<T>(permutation);
                }
                else
                {
                    c[index] = 0;
                    index += 1;
                }
        }

        public static async Task Dispatch<T>(
            this IEnumerable<T> enumerable,
            Func<T, Task>       func,
            int                 maxConcurrent
            )
        {
            if(maxConcurrent <= 0)
                throw new ArgumentOutOfRangeException("maxConcurrent");

            var pending = new Queue<T>(enumerable);
            var tasks   = new List<Task>();

            while(pending.Count + tasks.Count > 0)
            {
                while(tasks.Count < maxConcurrent && pending.Count > 0)
                    tasks.Add(func(pending.Dequeue()));

                tasks.Remove(await Task.WhenAny(tasks));
            }
        }
    }
}
