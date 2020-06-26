namespace Web.Model
{
    public class Range<T>
    {
        public virtual T Start { get; set; }
        public virtual T End   { get; set; }

        public Range()
        {
        }
    }
}
