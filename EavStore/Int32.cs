using System;

namespace EavStore
{
    public class Int32: Value
    {
        private int _value;
        private IConvertible _c;

        public Int32(
            int value
            )
        {
            _value = value;
            _c = value;
        }

        public override TypeCode GetTypeCode() => _value.GetTypeCode();

        public override int     ToInt32  (IFormatProvider provider) => _value;
        public override long    ToInt64  (IFormatProvider provider) => _value;
        public override decimal ToDecimal(IFormatProvider provider) => _value;
    }
}
