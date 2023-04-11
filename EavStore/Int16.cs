using System;

namespace EavStore
{
    public class Int16: Value
    {
        private short _value;

        public Int16(
            short value
            )
        {
            _value = value;
        }

        public override TypeCode GetTypeCode() => _value.GetTypeCode();

        public override short   ToInt16  (IFormatProvider provider) => _value;
        public override int     ToInt32  (IFormatProvider provider) => _value;
        public override long    ToInt64  (IFormatProvider provider) => _value;
        public override decimal ToDecimal(IFormatProvider provider) => _value;
    }
}
