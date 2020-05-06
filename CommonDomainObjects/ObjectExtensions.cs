using System;
using System.Collections;
using System.Collections.Generic;

namespace CommonDomainObjects
{
    public static class ObjectExtensions
    {
        private struct EnumerableValue<T>: IEnumerable<T>
        {
            private T _t;

            private struct ValueEnumerator<T>: IEnumerator<T>
            {
                private readonly T _t;
                private int        _index;

                public ValueEnumerator(
                    T t
                    )
                {
                    _t       = t;
                    _index   = -1;
                }

                T IEnumerator<T>.Current => _t;

                object IEnumerator.Current => _t;

                void IDisposable.Dispose()
                {
                }

                bool IEnumerator.MoveNext()
                {
                    switch(_index)
                    {
                        case -1:
                            if(_t == null)
                            {
                                _index = 1;
                                return false;
                            }
                            _index = 0;
                            return true;
                        case 0:
                            _index = 1;
                            return false;
                        default:
                        case 1:
                            return false;
                    }
                }

                void IEnumerator.Reset() => _index = -1;
            }

            public EnumerableValue(
                T t
                )
            {
                _t = t;
            }

            public IEnumerator<T> GetEnumerator()
            {
                return new ValueEnumerator<T>(_t);
            }

            IEnumerator IEnumerable.GetEnumerator()
            {
                return GetEnumerator();
            }
        }

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

        public static IEnumerable<T> ToEnumerable<T>(
            this T t
            )
        {
            return new EnumerableValue<T>(t);
        }
    }
}
