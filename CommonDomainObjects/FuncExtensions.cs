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

        public static bool PreservesStructure<A, B, C, D>(
            this Func<A, C> ac,
            Func<A, B>      ab,
            Func<C, D>      cd,
            Func<B, D>      bd,
            A               a
            ) => Equals(cd(ac(a)), bd(ab(a)));

        public static bool PreservesStructure<U, V>(
            this Func<U, V>         map,
            Func<U, IEnumerable<U>> uMorphism,
            Func<V, IEnumerable<V>> vMorphism,
            U                       u
            ) => vMorphism(map(u)).ToHashSet().SetEquals(uMorphism(u).Select(map));            

        public static bool PreservesStructure<A, B, C, D>(
            this Func<A, C>         ac,
            Func<A, IEnumerable<B>> ab,
            Func<C, IEnumerable<D>> cd,
            Func<B, D>              bd,
            A                       a
            ) => cd(ac(a)).ToHashSet().SetEquals(ab(a).Select(bd));
    }
}
