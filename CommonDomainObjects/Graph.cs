using System.Collections.Generic;

namespace CommonDomainObjects
{
    public abstract class Graph<TId, TGraph, TVertex, TEdge, T>: DomainObject<TId>
        where TGraph: Graph<TId, TGraph, TVertex, TEdge, T>
        where TVertex: Vertex<TId, TGraph, TVertex, TEdge, T>
        where TEdge: Edge<TId, TGraph, TVertex, TEdge, T>
    {
        public virtual IList<TVertex> Vertices { get; protected set; }
        public virtual IList<TEdge>   Edges    { get; protected set; }

        protected Graph(
            TId id
            ) : base(id)
        {
        }
    }

    public abstract class Vertex<TId, TGraph, TVertex, TEdge, T>: DomainObject<TId>
        where TGraph : Graph<TId, TGraph, TVertex, TEdge, T>
        where TVertex : Vertex<TId, TGraph, TVertex, TEdge, T>
        where TEdge : Edge<TId, TGraph, TVertex, TEdge, T>
    {
        public virtual TGraph       Graph { get; protected set; }
        public virtual IList<TEdge> Out   { get; protected set; }
        public virtual IList<TEdge> In    { get; protected set; }

        protected Vertex(
            TId    id,
            TGraph graph
            ) : base(id)
        {
            Graph = graph;
            Graph.Vertices.Add((TVertex)this);
        }
    }

    public abstract class Edge<TId, TGraph, TVertex, TEdge, T>: DomainObject<TId>
        where TGraph : Graph<TId, TGraph, TVertex, TEdge, T>
        where TVertex : Vertex<TId, TGraph, TVertex, TEdge, T>
        where TEdge : Edge<TId, TGraph, TVertex, TEdge, T>
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
            Graph.Edges.Add((TEdge)this);
            Out = @out;
            In  = @in;
            Out.Out.Add((TEdge)this);
            In.In.Add((TEdge)this);
        }
    }
}
