using System;
using System.Collections.Generic;
using System.Linq;

namespace CommonDomainObjects
{
    public static class FuncExtensions
    {
        public static bool PreservesStructure<U, V>(
            this Func<U, V> map,
            Func<U, U>      uMorphism,
            Func<V, V>      vMorphism,
            U               u
            ) => Equals(vMorphism(map(u)), map(uMorphism(u)));

        public static bool PreservesStructure<U, V>(
            this Func<U, V>         map,
            Func<U, IEnumerable<U>> uMorphism,
            Func<V, IEnumerable<V>> vMorphism,
            U                       u
            ) => vMorphism(map(u)).ToHashSet().SetEquals(uMorphism(u).Select(map));
    }
}
