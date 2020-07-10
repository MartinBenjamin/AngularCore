using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public interface ITreeVertex<out TVertex>
        where TVertex: ITreeVertex<TVertex>
    {
        TVertex                Parent   { get; }

        IReadOnlyList<TVertex> Children { get; }
    }

    public static class ITreeVertexExtensions
    {
        public static void Visit<TVertex>(
            this TVertex    treeVertex,
            Action<TVertex> enter,
            Action<TVertex> exit = null
            ) where TVertex: ITreeVertex<TVertex>
        {
            enter?.Invoke(treeVertex);

            treeVertex.Children.ForEach(child => child.Visit(
                    enter,
                    exit));

            exit?.Invoke(treeVertex);
        }

        public static async Task VisitAsync<TVertex>(
            this TVertex        treeVertex,
            Func<TVertex, Task> enter,
            Func<TVertex, Task> exit = null
            ) where TVertex : ITreeVertex<TVertex>
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
