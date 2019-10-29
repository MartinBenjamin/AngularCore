namespace Iso4217
{
    public struct MoneyAmount
    {
        public decimal  Value    { get; private set; }
        public Currency Currency { get; private set; }

        public MoneyAmount(
            decimal  value,
            Currency currency
            )
        {
            Value    = value;
            Currency = currency;
        }
    }
}
