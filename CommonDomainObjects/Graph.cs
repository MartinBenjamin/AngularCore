using System.Collections.Generic;
using System.Linq;

namespace CommonDomainObjects
{
    public abstract class Graph<TGraph, TVertex, TEdge>
        where TGraph : Graph<TGraph, TVertex, TEdge>
        where TEdge  : Edge <TGraph, TVertex, TEdge>
    {
        public virtual IList<TVertex> Vertices { get; protected set; }
        public virtual IList<TEdge>   Edges    { get; protected set; }

        protected Graph()
        {
            Vertices = new List<TVertex>();
            Edges    = new List<TEdge>();
        }

        protected virtual int LongestPath(
            IDictionary<TVertex, int> longestPaths,
            TVertex                   vertex
            )
        {
            if(!longestPaths.ContainsKey(vertex))
                longestPaths[vertex] = (
                    from edge in Edges
                    where edge.Out.Equals(vertex)
                    select LongestPath(
                        longestPaths,
                        edge.In) + 1)
                    .Append(0)
                    .Max();

            return longestPaths[vertex];
        }

        public virtual int LongestPath(
            TVertex vertex
            )
        {
            return LongestPath(
                new Dictionary<TVertex, int>(),
                vertex);
        }

        public virtual IEnumerable<TVertex> TopologicalSort()
        {
            IDictionary<TVertex, int> longestPaths = new Dictionary<TVertex, int>();

            return
                from vertex in Vertices
                orderby LongestPath(
                    longestPaths,
                    vertex)
                select vertex;
        }
    }

    public abstract class Edge<TGraph, TVertex, TEdge>
        where TGraph : Graph<TGraph, TVertex, TEdge>
        where TEdge  : Edge <TGraph, TVertex, TEdge>
    {
        public virtual TGraph  Graph { get; protected set; }
        public virtual TVertex Out   { get; protected set; }
        public virtual TVertex In    { get; protected set; }

        protected Edge(
            TGraph  graph,
            TVertex @out,
            TVertex @in
            )
        {
            Graph = graph;
            Out   = @out;
            In    = @in;

            if(!Graph.Vertices.Contains(Out))
                Graph.Vertices.Add(Out);

            if(!Graph.Vertices.Contains(In))
                Graph.Vertices.Add(In);

            Graph.Edges.Add((TEdge)this);
        }
    }

    public class Graph<TVertex>: Graph<Graph<TVertex>, TVertex, Edge<TVertex>>
    {
        public Graph() : base()
        {
        }
    }

    public class Edge<TVertex>: Edge<Graph<TVertex>, TVertex, Edge<TVertex>>
    {
        public Edge(
            Graph<TVertex> graph,
            TVertex        @out,
            TVertex        @in
            ) : base(
                graph,
                @out,
                @in)
        {
        }
    }
}
