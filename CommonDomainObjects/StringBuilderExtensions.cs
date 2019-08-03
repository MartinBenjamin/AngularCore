using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonDomainObjects
{
    public static class StringBuilderExtensions
    {
        public static StringBuilder AppendJoin<T>(
            this StringBuilder builder,
            char               separator,
            IEnumerable<T>     values
            )
        {
            return builder.AppendJoin(
                separator.ToString(),
                values);
        }

        public static StringBuilder AppendJoin<T>(
            this StringBuilder builder,
            string             separator,
            IEnumerable<T>     values
            )
        {
            if(values.Any())
            {
                builder.Append(values.First());

                foreach(var value in values.Skip(1))
                {
                    builder.Append(separator);
                    builder.Append(value);
                }
            }

            return builder;
        }
    }
}
