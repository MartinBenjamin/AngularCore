using System;
using System.Collections.Generic;

namespace CommonDomainObjects
{
    public static class IListExtensions
    {
        public static int BinarySearchFirst<T>(
            this IList<T> list,
            T             t
            ) where T : IComparable<T>
        {
            if(list.Count == 0)
                return -1;

            var start = 0;
            var end = list.Count - 1;

            while(start != end)
            {
                var mid = (start + end) / 2;

                if(list[mid].CompareTo(t) < 0)
                    // mid value < t.
                    start = mid + 1;

                else
                    // mid value >= t.
                    end = mid;
            }

            return list[start].CompareTo(t) == 0 ? start : -1;
        }

        public static int BinarySearchLast<T>(
            this IList<T> list,
            T             t
            ) where T : IComparable<T>
        {
            if(list.Count == 0)
                return -1;

            var start = 0;
            var end = list.Count - 1;

            while(start != end)
            {
                var mid = (start + end + 1) / 2;

                if(list[mid].CompareTo(t) <= 0)
                    // mid value <= t.
                    start = mid;

                else
                    // mid value > t.
                    end = mid - 1;
            }

            return list[start].CompareTo(t) == 0 ? start : -1;
        }

        public static int BinarySearchFirstAfter<T>(
            this IList<T> list,
            T             t
            ) where T : IComparable<T>
        {
            if(list.Count == 0)
                return -1;

            var start = 0;
            var end = list.Count - 1;

            while(start != end)
            {
                var mid = (start + end) / 2;

                if(list[mid].CompareTo(t) <= 0)
                    // mid value <= t.
                    start = mid + 1;

                else
                    // mid value > t.
                    end = mid;
            }

            return list[start].CompareTo(t) > 0 ? start : -1;
        }

        public static int BinarySearchLastBefore<T>(
            this IList<T> list,
            T             t
            ) where T : IComparable<T>
        {
            if(list.Count == 0)
                return -1;

            var start = 0;
            var end = list.Count - 1;

            while(start != end)
            {
                var mid = (start + end + 1) / 2;

                if(list[mid].CompareTo(t) < 0)
                    // mid value < t.
                    start = mid;

                else
                    // mid value >= t;
                    end = mid - 1;
            }

            return list[start].CompareTo(t) < 0 ? start : -1;
        }
    }
}
