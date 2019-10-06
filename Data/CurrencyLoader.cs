using Iso4217;
using NHibernate;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Data
{
    public class CurrencyLoader: ILoader<IEnumerable<Currency>>
    {
        private ISessionFactory _sessionFactory;

        public CurrencyLoader(
            ISessionFactory sessionFactory
            )
        {
            _sessionFactory = sessionFactory;
        }

        async Task ILoader<IEnumerable<Currency>>.LoadAsync(
            IEnumerable<Currency> currencies
            )
        {
            using(var session = _sessionFactory.OpenSession())
            {
                foreach(var currency in currencies)
                    await session.SaveAsync(currency);
                await session.FlushAsync();
            }
        }
    }
}
