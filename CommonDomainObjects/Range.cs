﻿using System;

namespace CommonDomainObjects
{
    // Closed Interval.
    public class Range<T> where T: struct, IComparable<T>
    {
        public virtual T Start { get; protected set; }
        public virtual T End   { get; protected set; }

        protected Range()
        { }

        public Range(
            T start,
            T end
            )
        {
            if(end.CompareTo(start) < 0)
                throw new ArgumentOutOfRangeException(
                    nameof(end),
                    $"{ nameof(end) } must be greater than or equal to { nameof(start) }.");

            Start = start;
            End   = end;
        }

        public bool Contains(
            T t
            ) =>
                t.CompareTo(Start) >= 0 &&
                t.CompareTo(End  ) <= 0;

        public bool Contains(
            Range<T> range
            ) =>
                Start.CompareTo(range.Start) <= 0 &&
                End.CompareTo(range.End) >= 0;

        public bool Overlaps(
            Range<T> range
            ) =>
                Start.CompareTo(range.End) <= 0 &&
                End.CompareTo(range.Start) >= 0;

        public override bool Equals(
            object obj
            ) => obj is Range<T> range &&
                Start.Equals(range.Start) &&
                End.Equals(range.End);

        public override int GetHashCode()
            => HashCode.Combine(
                Start,
                End);

        public override string ToString()
            => string.Format(
                "[{0}, {1}]",
                Start,
                End);

        public static bool operator ==(
            Range<T> lhs,
            Range<T> rhs
            ) => Equals(
                lhs,
                rhs);

        public static bool operator !=(
            Range<T> lhs,
            Range<T> rhs
            ) => !(lhs == rhs);
    }

    // Supports left and right unbounded intervals.
    public class Range2<T> where T: struct, IComparable<T>
    {
        public static readonly T? Unbounded = null;

        public virtual T? Start { get; protected set; }
        public virtual T? End   { get; protected set; }

        public Range2()
        { }

        public Range2(
            T? start,
            T? end
            )
        {
            if(start.HasValue && end.HasValue && end.Value.CompareTo(start.Value) < 0)
                throw new ArgumentOutOfRangeException(
                    nameof(end),
                    $"{ nameof(end) } must be greater than or equal to { nameof(start) }.");

            Start = start;
            End   = end;
        }

        public bool Contains(
            T t
            ) =>
                (!Start.HasValue || t.CompareTo(Start.Value) >= 0) &&
                (!End.HasValue   || t.CompareTo(End.Value  ) <= 0);

        public bool Contains(
            Range2<T> range
            ) =>
                (!Start.HasValue || (range.Start.HasValue && Start.Value.CompareTo(range.Start.Value) <= 0)) &&
                (!End.HasValue   || (range.End.HasValue   && End.Value.CompareTo(range.End.Value)     >= 0));

        public bool Overlaps(
            Range2<T> range
            ) =>
                (!Start.HasValue || !range.End.HasValue   || Start.Value.CompareTo(range.End.Value) <= 0) &&
                (!End.HasValue   || !range.Start.HasValue || End.Value.CompareTo(range.Start.Value) >= 0);

        public override bool Equals(
            object obj
            ) => obj is Range2<T> range &&
                Start.Equals(range.Start) &&
                End.Equals(range.End);

        public override int GetHashCode()
            => HashCode.Combine(
                Start,
                End);

        public static bool operator ==(
            Range2<T> lhs,
            Range2<T> rhs
            ) => Equals(
                lhs,
                rhs);

        public static bool operator !=(
            Range2<T> lhs,
            Range2<T> rhs
            ) => !(lhs == rhs);

        public override string ToString()
            => string.Format(
                "[{0}, {1}]",
                Start.HasValue ? Start.Value.ToString() : string.Empty,
                End.HasValue   ? End.Value.ToString()   : string.Empty);
    }
}