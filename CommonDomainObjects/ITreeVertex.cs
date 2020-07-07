using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public interface ITreeVertex<out TTreeVertex>
        where TTreeVertex: ITreeVertex<TTreeVertex>
    {
        TTreeVertex                Parent   { get; }

        IReadOnlyList<TTreeVertex> Children { get; }
    }

    public static class ITreeVertexExtensions
    {
        public static void Visit<TTreeVertex>(
            this TTreeVertex    treeVertex,
            Action<TTreeVertex> enter,
            Action<TTreeVertex> exit = null
            ) where TTreeVertex: ITreeVertex<TTreeVertex>
        {
            enter?.Invoke(treeVertex);

            treeVertex.Children.ForEach(child => child.Visit(
                    enter,
                    exit));

            exit?.Invoke(treeVertex);
        }

        public static async Task VisitAsync<TTreeVertex>(
            this TTreeVertex        treeVertex,
            Func<TTreeVertex, Task> enter,
            Func<TTreeVertex, Task> exit = null
            ) where TTreeVertex : ITreeVertex<TTreeVertex>
        {
            if(enter != null)
                await enter(treeVertex);

            await treeVertex.Children.ForEachAsync(child => child.VisitAsync(
                enter,
                exit));

            if(exit != null)
                await exit(treeVertex);
        }
    }
}
