using System;
using System.Collections.Generic;

namespace CommonDomainObjects
{
    public static class IListExtensions
    {
        public static int BinarySearchFirst<T>(
            this IList<T> list,
            T             t,
            int           start,
            int           end
            ) where T : IComparable<T>
        {
            if(list.Count == 0)
                return -1;

            if(start == end)
                return list[start].CompareTo(t) == 0 ? start : -1;

            var mid = (start + end) / 2;
            var midValue = list[mid];
            var comparison = midValue.CompareTo(t);

            if(comparison < 0)
                // midValue < t.
                return list.BinarySearchFirst(
                    t,
                    mid + 1,
                    end);

            else
                // midValue >= t.
                return list.BinarySearchFirst(
                    t,
                    start,
                    mid);
        }

        public static int BinarySearchLast<T>(
            this IList<T> list,
            T             t,
            int           start,
            int           end
            ) where T : IComparable<T>
        {
            if(list.Count == 0)
                return -1;

            if(start == end)
                return list[start].CompareTo(t) == 0 ? start : -1;

            var mid = (start + end + 1) / 2;
            var midValue = list[mid];
            var comparison = midValue.CompareTo(t);

            if(comparison <= 0)
                // midValue <= t.
                return list.BinarySearchLast(
                    t,
                    mid,
                    end);

            else
                // midValue > t.
                return list.BinarySearchLast(
                    t,
                    start,
                    mid - 1);
        }

        public static int BinarySearchFirstGreaterThan<T>(
            this IList<T> list,
            T             t,
            int           start,
            int           end
            ) where T : IComparable<T>
        {
            if(list.Count == 0)
                return -1;

            if(start == end)
                return list[start].CompareTo(t) > 0 ? start : -1;

            var mid = (start + end) / 2;
            var midValue = list[mid];
            var comparison = midValue.CompareTo(t);

            if(comparison <= 0)
                // midValue <= t.
                return list.BinarySearchFirstGreaterThan(
                    t,
                    mid + 1,
                    end);

            else
                // midValue > t.
                return list.BinarySearchFirstGreaterThan(
                    t,
                    start,
                    mid);
        }

        public static int BinarySearchLastLessThan<T>(
            this IList<T> list,
            T             t,
            int           start,
            int           end
            ) where T : IComparable<T>
        {
            if(list.Count == 0)
                return -1;

            if(start == end)
                return list[start].CompareTo(t) < 0 ? start : -1;

            var mid = (start + end + 1) / 2;
            var midValue = list[mid];
            var comparison = midValue.CompareTo(t);

            if(comparison < 0)
                // midValue < t.
                return list.BinarySearchLastLessThan(
                    t,
                    mid,
                    end);

            else
                // midValue >= t;
                return list.BinarySearchLastLessThan(
                    t,
                    start,
                    mid - 1);
        }
    }
}
