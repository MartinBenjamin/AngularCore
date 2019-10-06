using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
    public interface IEtl<T>
    {
        Task<T> ExecuteAsync();
    }
}
