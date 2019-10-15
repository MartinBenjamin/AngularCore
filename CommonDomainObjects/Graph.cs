using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CommonDomainObjects
{
    public abstract class Graph<TId, TGraph, TVertex, TEdge, TUnderlying>: DomainObject<TId>
        where TGraph : Graph <TId, TGraph, TVertex, TEdge, TUnderlying>
        where TVertex: Vertex<TId, TGraph, TVertex, TEdge, TUnderlying>
        where TEdge  : Edge  <TId, TGraph, TVertex, TEdge, TUnderlying>
    {
        public virtual IList<TVertex> Vertices { get; protected set; }
        public virtual IList<TEdge>   Edges    { get; protected set; }

        protected Graph(
            TId id
            ) : base(id)
        {
        }

        public virtual void Visit(
            Action<TVertex> before,
            Action<TVertex> after = null
            )
        {
            var visited = new List<TVertex>();
            foreach(var vertex in Vertices)
                vertex.Visit(
                    visited,
                    before,
                    after);
        }

        public virtual async Task VisitAsync(
            Func<TVertex, Task> before,
            Func<TVertex, Task> after = null
            )
        {
            var visited = new List<TVertex>();
            foreach(var vertex in Vertices)
                await vertex.VisitAsync(
                    visited,
                    before,
                    after);
        }
    }

    public abstract class Vertex<TId, TGraph, TVertex, TEdge, TUnderlying>: DomainObject<TId>
        where TGraph  : Graph <TId, TGraph, TVertex, TEdge, TUnderlying>
        where TVertex : Vertex<TId, TGraph, TVertex, TEdge, TUnderlying>
        where TEdge   : Edge  <TId, TGraph, TVertex, TEdge, TUnderlying>
    {
        public virtual TGraph       Graph      { get; protected set; }
        public virtual TUnderlying  Underlying { get; protected set; }
        public virtual IList<TEdge> Out        { get; protected set; }
        public virtual IList<TEdge> In         { get; protected set; }

        protected Vertex(
            TId         id,
            TGraph      graph,
            TUnderlying underlying
            ) : base(id)
        {
            Graph      = graph;
            Underlying = underlying;
            Out        = new List<TEdge>();
            In         = new List<TEdge>();
            Graph.Vertices.Add((TVertex)this);
        }

        internal void Visit(
            IList<TVertex>  visited,
            Action<TVertex> before,
            Action<TVertex> after
            )
        {
            if(visited.Contains((TVertex)this))
                return;

            before?.Invoke((TVertex)this);

            foreach(TVertex vertex in Out.Select(edge => edge.In))
                vertex.Visit(
                    visited,
                    before,
                    after);

            after?.Invoke((TVertex)this);
        }

        public virtual async Task VisitAsync(
            IList<TVertex>      visited,
            Func<TVertex, Task> before,
            Func<TVertex, Task> after = null
            )
        {
            if(visited.Contains((TVertex)this))
                return;

            if(before != null)
                await before((TVertex)this);

            foreach(TVertex vertex in Out.Select(edge => edge.In))
                await vertex.VisitAsync(
                    visited,
                    before,
                    after);

            if(after != null)
                await after((TVertex)this);
        }
    }

    public abstract class Edge<TId, TGraph, TVertex, TEdge, TUnderlying>: DomainObject<TId>
        where TGraph  : Graph <TId, TGraph, TVertex, TEdge, TUnderlying>
        where TVertex : Vertex<TId, TGraph, TVertex, TEdge, TUnderlying>
        where TEdge   : Edge  <TId, TGraph, TVertex, TEdge, TUnderlying>
    {
        public virtual TGraph  Graph { get; protected set; }
        public virtual TVertex Out   { get; protected set; }
        public virtual TVertex In    { get; protected set; }

        protected Edge(
            TId     id,
            TGraph  graph,
            TVertex @out,
            TVertex @in
            ) : base(id)
        {
            Graph = graph;
            Out   = @out;
            In    = @in;
            Graph.Edges.Add((TEdge)this);
            Out.Out.Add((TEdge)this);
            In.In.Add((TEdge)this);
        }
    }

    public class Graph<TUnderlying>: Graph<Guid, Graph<TUnderlying>, Vertex<TUnderlying>, Edge<TUnderlying>, TUnderlying>
    {
        public Graph(
            Guid id
            ) : base(id)
        {
        }
    }

    public class Vertex<TUnderlying>: Vertex<Guid, Graph<TUnderlying>, Vertex<TUnderlying>, Edge<TUnderlying>, TUnderlying>
    {
        public Vertex(
            Guid               id,
            Graph<TUnderlying> graph,
            TUnderlying        underlying
            ) : base(
                id,
                graph,
                underlying)
        {
        }
    }

    public class Edge<TUnderlying>: Edge<Guid, Graph<TUnderlying>, Vertex<TUnderlying>, Edge<TUnderlying>, TUnderlying>
    {
        public Edge(
            Guid                id,
            Graph<TUnderlying>  graph,
            Vertex<TUnderlying> @out,
            Vertex<TUnderlying> @in
            ) : base(
                id,
                graph,
                @out,
                @in)
        {
        }
    }

    public static class GraphExtensions
    {
        private static int LongestPath<TId, TGraph, TVertex, TEdge, TUnderlying>(
            this TGraph               graph,
            IDictionary<TVertex, int> longestPaths,
            TVertex                   vertex
            )
            where TGraph  : Graph <TId, TGraph, TVertex, TEdge, TUnderlying>
            where TVertex : Vertex<TId, TGraph, TVertex, TEdge, TUnderlying>
            where TEdge   : Edge  <TId, TGraph, TVertex, TEdge, TUnderlying>
        {
            if(!longestPaths.ContainsKey(vertex))
                longestPaths[vertex] = vertex
                    .Out
                    .Select(edge => graph.LongestPath<TId, TGraph, TVertex, TEdge, TUnderlying>(
                        longestPaths,
                        edge.In) + 1)
                    .Append(0)
                    .Max();

            return longestPaths[vertex];
        }

        public static int LongestPath<TId, TGraph, TVertex, TEdge, TUnderlying>(
            this TGraph graph,
            TVertex     vertex
            )
            where TGraph  : Graph <TId, TGraph, TVertex, TEdge, TUnderlying>
            where TVertex : Vertex<TId, TGraph, TVertex, TEdge, TUnderlying>
            where TEdge   : Edge  <TId, TGraph, TVertex, TEdge, TUnderlying>
        {
            return graph.LongestPath<TId, TGraph, TVertex, TEdge, TUnderlying>(
                new Dictionary<TVertex, int>(),
                vertex);
        }

        public static IEnumerable<TVertex> TopologicalSort<TId, TGraph, TVertex, TEdge, TUnderlying>(
            this TGraph graph
            )
            where TGraph  : Graph <TId, TGraph, TVertex, TEdge, TUnderlying>
            where TVertex : Vertex<TId, TGraph, TVertex, TEdge, TUnderlying>
            where TEdge   : Edge  <TId, TGraph, TVertex, TEdge, TUnderlying>
        {
            IDictionary<TVertex, int> longestPaths = new Dictionary<TVertex, int>();

            return
                from vertex in graph.Vertices
                orderby graph.LongestPath<TId, TGraph, TVertex, TEdge, TUnderlying>(
                    longestPaths,
                    vertex)
                select vertex;
        }
    }
}
