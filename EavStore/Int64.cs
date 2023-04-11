using System;

namespace EavStore
{
    public class Int64: Value
    {
        private long _value;

        public Int64(
            long value
            )
        {
            _value = value;
        }

        public override TypeCode GetTypeCode() => _value.GetTypeCode();

        public override long    ToInt64  (IFormatProvider provider) => _value;
        public override decimal ToDecimal(IFormatProvider provider) => _value;
    }
}
