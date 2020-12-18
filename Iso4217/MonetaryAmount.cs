namespace Iso4217
{
    public struct MonetaryAmount
    {
        public Currency Currency { get; private set; }
        public decimal  Amount   { get; private set; }

        public MonetaryAmount(
            Currency currency,
            decimal  amount
            )
        {
            Currency = currency;
            Amount   = amount;
        }
    }
}
