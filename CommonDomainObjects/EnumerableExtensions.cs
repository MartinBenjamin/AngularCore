﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public static class EnumerableExtensions
    {
        public static void ForEach<T>(
            this IEnumerable<T> enumerable,
            Action<T>           action
            )
        {
            foreach(var t in enumerable)
                action(t);
        }

        public static async Task ForEachAsync<T>(
            this IEnumerable<T> enumerable,
            Func<T, Task>       func
            )
        {
            foreach(var t in enumerable)
                await func(t);
        }

        public static async Task ForEachAsync<T>(
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

        public static IEnumerable<IEnumerable<T>> Batch<T>(
            this IEnumerable<T> source,
            int                 size
            )
        {
            List<T> nextbatch = new List<T>(size);
            foreach(var t in source)
            {
                nextbatch.Add(t);
                if(nextbatch.Count == size)
                {
                    yield return nextbatch;
                    nextbatch = new List<T>(size);
                }
            }

            if(nextbatch.Count > 0)
                yield return nextbatch;
        }

        public static bool PreservesStructure<U, V>(
            this IEnumerable<U> category,
            Func<U, U>          morphism,
            Func<U, V>          map,
            Func<V, V>          mappedMorphism
            ) => category.All(u => Equals(mappedMorphism(map(u)), map(morphism(u))));

        public static bool PreservesStructure<U1, V1, U2, V2>(
            this IEnumerable<U1> category,
            Func<U1, U2>         u2,
            Func<U1, V1>         v1Map,
            Func<U2, V2>         v2Map,
            Func<V1, V2>         v2
            ) => category.All(u1 => Equals(v2(v1Map(u1)), v2Map(u2(u1))));

        public static bool PreservesStructure<U, V>(
            this IEnumerable<U>     category,
            Func<U, IEnumerable<U>> morphism,
            Func<U, V>              map,
            Func<V, IEnumerable<V>> mappedMorphism
            ) => category.All(u => mappedMorphism(map(u)).ToHashSet().SetEquals(morphism(u).Select(map)));

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
    }
}
