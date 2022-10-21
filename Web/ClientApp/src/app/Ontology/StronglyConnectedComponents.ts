/*
 
  BEGIN
    INTEGER i;
    PROCEDURE STRONGCONNECT (v);
    BEGIN
      LOWLINK (v) := NUMBER (v) := i := i + 1;
      put v on stack of points;
      FOR w in the adjacency list of v DO
      BEGIN
        IF w is not yet numbered THEN
        BEGIN comment (v, w) is a tree arc;
          STRONGCONNECT (w);
          LOWLINK (v) := min (LOWLINK (v), LOWLINK (w));
        END
        ELSE IF NUMBER (w) < NUMBER (v) DO
        BEGIN comment (v, w) is a frond or cross-link;
          if w is on stack of points THEN
            LOWLINK (v) := min (LOWLINK (v), NUMBER (w));
        END;
      END;

      If (LOWLINK (v) = NUMBER (v)) THEN
      BEGIN comment v is the root of a component;
        start new strongly connected component;
        WHILE w on top of point stack satisfies NUMBER (w) >= NUMBER (v) DO
          delete w from point stack and put w in current component
      END;

    i = 0;
    empty stack of points;
    FOR w a vertex IF w is not yet numbered THEN STRONGCONNECT(w);
  END;
*/

export function StronglyConnectedComponents<TVertex>(
    graph: ReadonlyMap<TVertex, Iterable<TVertex>>
    ): TVertex[][]
{
    const stronglyConnectedComponents: TVertex[][] = [];
    const lowlink = new Map<TVertex, number>();
    const number = new Map<TVertex, number>();
    const stack: TVertex[] = [];

    let i = 0;

    function StronglyConnect(
        v: TVertex
        )
    {
        i += 1;
        lowlink.set(v, i);
        number.set(v, i);
        stack.push(v);

        for(const w of graph.get(v))
            if(!number.get(w))
            {
                StronglyConnect(w);
                lowlink.set(
                    v,
                    Math.min(lowlink.get(v), lowlink.get(w)));
            }
            else if(stack.includes(w))
                lowlink.set(
                    v,
                    Math.min(lowlink.get(v), number.get(w)));

        if(lowlink.get(v) === number.get(v))
        {
            const stronglyConnectedComponent: TVertex[] = [];
            stronglyConnectedComponents.push(stronglyConnectedComponent);

            let w: TVertex;
            do
            {
                w = stack.pop();
                stronglyConnectedComponent.push(w);
            }
            while(w !== v)
        }
    }

    for(const v of graph.keys())
        if(!number.get(v))
            StronglyConnect(v);

    return stronglyConnectedComponents;
}

export function Condense<TVertex>(
    graph: ReadonlyMap<TVertex, Iterable<TVertex>>
    ): Map<TVertex[], Iterable<TVertex[]>>
{
    const stronglyConnectedComponents = StronglyConnectedComponents(graph);
    const map = new Map<TVertex, TVertex[]>([].concat(...stronglyConnectedComponents.map(
        stronglyConnectedComponent => stronglyConnectedComponent.map<[TVertex, TVertex[]]>(
            vertex => [vertex, stronglyConnectedComponent]))));

    return new Map(stronglyConnectedComponents.map(
        stronglyConnectedComponent =>
            [
                stronglyConnectedComponent,
                new Set<TVertex[]>([].concat(
                    ...stronglyConnectedComponent.map(
                        vertex => [...graph.get(vertex)]
                            .map(adjacent => map.get(adjacent))
                            .filter(adjacentStronglyConnectedComponent => adjacentStronglyConnectedComponent !== stronglyConnectedComponent))))
            ]));
    //const condensed = new Map(stronglyConnectedComponents.map(
    //    stronglyConnectedComponent =>
    //        [
    //            stronglyConnectedComponent,
    //            new Set<TVertex[]>()
    //        ]));

    //for(const [stronglyConnectedComponent, adjacentStronglyConnectedComponents] of condensed)
    //    for(const vertex of stronglyConnectedComponent)
    //        for(const adjacent of graph.get(vertex))
    //        {
    //            const adjacentStronglyConnectedComponent = map.get(adjacent);
    //            if(adjacentStronglyConnectedComponent !== stronglyConnectedComponent)
    //                adjacentStronglyConnectedComponents.add(adjacentStronglyConnectedComponent);
    //        }

    //return condensed;
}
