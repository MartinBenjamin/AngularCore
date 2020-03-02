using System.Collections.Generic;
using System.Linq;

namespace CommonDomainObjects
{
    public abstract class Graph<TGraph, TVertex, TEdge>
        where TGraph : Graph<TGraph, TVertex, TEdge>
        where TEdge  : Edge <TVertex, TEdge>
    {
        public virtual IList<TVertex> Vertices { get; protected set; }
        public virtual IList<TEdge>   Edges    { get; protected set; }

        protected Graph()
        {
            Vertices = new List<TVertex>();
            Edges    = new List<TEdge>();
        }

        protected Graph(
            IList<TVertex> vertices,
            IList<TEdge>   edges
            )
        {
            Vertices = vertices;
            Edges    = edges;
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
            return
                from vertex in Vertices
                orderby LongestPath(
                    new Dictionary<TVertex, int>(),
                    vertex)
                select vertex;
        }
    }

    public abstract class Edge<TVertex, TEdge>
        where TEdge : Edge<TVertex, TEdge>
    {
        public virtual TVertex Out { get; protected set; }
        public virtual TVertex In  { get; protected set; }

        protected Edge(
            TVertex @out,
            TVertex @in
            )
        {
            Out = @out;
            In  = @in;
        }
    }

    public class Graph<TVertex>: Graph<Graph<TVertex>, TVertex, Edge<TVertex>>
    {
        public Graph() : base()
        {
        }
        
        public Graph(
            IList<TVertex>       vertices,
            IList<Edge<TVertex>> edges
            ) : base(
                vertices,
                edges)
        {
        }
    }

    public class Edge<TVertex>: Edge<TVertex, Edge<TVertex>>
    {
        public Edge(
            TVertex @out,
            TVertex @in
            ) : base(
                @out,
                @in)
        {
        }
    }
}
