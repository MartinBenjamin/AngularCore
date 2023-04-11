using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace EavStore
{
    public class Comparer: IComparer<IConvertible>
    {
        private static Func<IConvertible, IConvertible, int>[,] _comparers;

        static Comparer()
        {
            var integerComparers = new Dictionary<TypeCode, Func<IConvertible, IConvertible, int>>
            {
                { TypeCode.SByte  , (lhs, rhs) => lhs.ToSByte  (null).CompareTo(rhs.ToSByte  (null)) },
                { TypeCode.Int16  , (lhs, rhs) => lhs.ToInt16  (null).CompareTo(rhs.ToInt16  (null)) },
                { TypeCode.Int32  , (lhs, rhs) => lhs.ToInt32  (null).CompareTo(rhs.ToInt32  (null)) },
                { TypeCode.Int64  , (lhs, rhs) => lhs.ToInt64  (null).CompareTo(rhs.ToInt64  (null)) },
                { TypeCode.Decimal, (lhs, rhs) => lhs.ToDecimal(null).CompareTo(rhs.ToDecimal(null)) }
            };

            var dimension = Enum.GetValues(typeof(TypeCode)).Cast<int>().Max() + 1;
            _comparers = new Func<IConvertible, IConvertible, int>[dimension, dimension];

            foreach(int lhsTypeCode in integerComparers.Keys)
                foreach(int rhsTypeCode in integerComparers.Keys)
                    _comparers[lhsTypeCode, rhsTypeCode] = integerComparers[(TypeCode)Math.Max(lhsTypeCode, rhsTypeCode)];

            _comparers[(int)TypeCode.Object, (int)TypeCode.Object] = integerComparers[TypeCode.Int64];
            _comparers[(int)TypeCode.String, (int)TypeCode.String] = (IConvertible lhs, IConvertible rhs) => lhs.ToString(null).CompareTo(rhs.ToString(null));
        }

        int IComparer<IConvertible>.Compare(
            IConvertible x,
            IConvertible y
            )
        {
            var lhsTypeCode = (int)x.GetTypeCode();
            var rhsTypeCode = (int)y.GetTypeCode();
            var comparer = _comparers[lhsTypeCode, rhsTypeCode];
            return comparer != null ? comparer(x, y) : lhsTypeCode - rhsTypeCode;
        }
    }
}
