using Iso4217;

namespace Web
{
    public class Profile: AutoMapper.Profile
    {
        public Profile()
        {
            CreateMap<Currency, Model.Currency>();
        }
    }
}
