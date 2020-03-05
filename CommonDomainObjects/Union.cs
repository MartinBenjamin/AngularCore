using System;

namespace CommonDomainObjects
{
    public struct Union<T1, T2>
    {
        private object _value;

        public Union(T1 t1) => _value = t1;
        public Union(T2 t2) => _value = t2;

        public void Switch(
            Action<T1> t1Case,
            Action<T2> t2Case,
            Action     defaultCase
            )
        {
            switch(_value)
            {
                case T1 t1: t1Case?.Invoke(t1); return;
                case T2 t2: t2Case?.Invoke(t2); return;
                default: defaultCase?.Invoke(); return;
            }
        }

        public TResult Switch<TResult>(
            Func<T1, TResult> t1Case,
            Func<T2, TResult> t2Case,
            Func<TResult>     defaultCase
            )
        {
            switch(_value)
            {
                case T1 t1: return t1Case != null ? t1Case(t1) : default;
                case T2 t2: return t2Case != null ? t2Case(t2) : default;
                default: return defaultCase != null ? defaultCase() : default;
            }
        }

        public static implicit operator Union<T1, T2>(T1 t1) => new Union<T1, T2>(t1);
        public static implicit operator Union<T1, T2>(T2 t2) => new Union<T1, T2>(t2);
    }

    public struct Union<T1, T2, T3>
    {
        private object _value;

        public Union(T1 t1) => _value = t1;
        public Union(T2 t2) => _value = t2;
        public Union(T3 t3) => _value = t3;

        public void Switch(
            Action<T1> t1Case,
            Action<T2> t2Case,
            Action<T3> t3Case,
            Action     defaultCase
            )
        {
            switch(_value)
            {
                case T1 t1: t1Case?.Invoke(t1); return;
                case T2 t2: t2Case?.Invoke(t2); return;
                case T3 t3: t3Case?.Invoke(t3); return;
                default: defaultCase?.Invoke(); return;
            }
        }

        public TResult Switch<TResult>(
            Func<T1, TResult> t1Case,
            Func<T2, TResult> t2Case,
            Func<T3, TResult> t3Case,
            Func<TResult>     defaultCase
            )
        {
            switch(_value)
            {
                case T1 t1: return t1Case != null ? t1Case(t1) : default;
                case T2 t2: return t2Case != null ? t2Case(t2) : default;
                case T3 t3: return t3Case != null ? t3Case(t3) : default;
                default: return defaultCase != null ? defaultCase() : default;
            }
        }

        public static implicit operator Union<T1, T2, T3>(T1 t1) => new Union<T1, T2, T3>(t1);
        public static implicit operator Union<T1, T2, T3>(T2 t2) => new Union<T1, T2, T3>(t2);
        public static implicit operator Union<T1, T2, T3>(T3 t3) => new Union<T1, T2, T3>(t3);
    }

    public struct Union<T1, T2, T3, T4>
    {
        private object _value;

        public Union(T1 t1) => _value = t1;
        public Union(T2 t2) => _value = t2;
        public Union(T3 t3) => _value = t3;
        public Union(T4 t4) => _value = t4;

        public void Switch(
            Action<T1> t1Case,
            Action<T2> t2Case,
            Action<T3> t3Case,
            Action<T4> t4Case,
            Action     defaultCase
            )
        {
            switch(_value)
            {
                case T1 t1: t1Case?.Invoke(t1); return;
                case T2 t2: t2Case?.Invoke(t2); return;
                case T3 t3: t3Case?.Invoke(t3); return;
                case T4 t4: t4Case?.Invoke(t4); return;
                default: defaultCase?.Invoke(); return;
            }
        }

        public TResult Switch<TResult>(
            Func<T1, TResult> t1Case,
            Func<T2, TResult> t2Case,
            Func<T3, TResult> t3Case,
            Func<T4, TResult> t4Case,
            Func<TResult>     defaultCase
            )
        {
            switch(_value)
            {
                case T1 t1: return t1Case != null ? t1Case(t1) : default;
                case T2 t2: return t2Case != null ? t2Case(t2) : default;
                case T3 t3: return t3Case != null ? t3Case(t3) : default;
                case T4 t4: return t4Case != null ? t4Case(t4) : default;
                default: return defaultCase != null ? defaultCase() : default;
            }
        }

        public static implicit operator Union<T1, T2, T3, T4>(T1 t1) => new Union<T1, T2, T3, T4>(t1);
        public static implicit operator Union<T1, T2, T3, T4>(T2 t2) => new Union<T1, T2, T3, T4>(t2);
        public static implicit operator Union<T1, T2, T3, T4>(T3 t3) => new Union<T1, T2, T3, T4>(t3);
        public static implicit operator Union<T1, T2, T3, T4>(T4 t4) => new Union<T1, T2, T3, T4>(t4);
    }
}
