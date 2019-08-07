using System.Threading.Tasks;

namespace MessageBroker
{
    public interface IMessageBroker
    {
        Task Handle(Message message);
    }
}
