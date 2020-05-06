using System;

namespace CommonDomainObjects
{
    public static class ObjectExtensions
    {
        public static object GetValue(
            this object o,
            string      path
            )
        {
            string propertyName  = null;
            string remainingPath = null;

            var index = path.IndexOf('.');

            if(index == -1)
                propertyName = path;

            else
            {
                propertyName = path.Substring(0, index);
                remainingPath = path.Substring(index + 1);
            }

            var propertyInfo = o.GetType().GetProperty(propertyName);

            if(propertyInfo == null)
                throw new ApplicationException($"Unknown property: { o.GetType().Name  }.{ propertyName }.");

            var value = propertyInfo.GetValue(
                o,
                null);

            return remainingPath != null ? value.GetValue(remainingPath) : value;
        }
    }
}
