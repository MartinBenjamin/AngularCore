type AdjacencyMatrix<TVertex> = Map<TVertex, Map<TVertex, boolean>>;

function TransitiveClosureDfs(
    adjacencyMatrix  : boolean[][],
    transitiveClosure: boolean[][],
    i                : number,
    j                : number
    )
{
    transitiveClosure[i][j] = true;
    for(let k = 0; k < adjacencyMatrix.length; ++k)
        if(adjacencyMatrix[j][k] && !transitiveClosure[i][k])
            TransitiveClosureDfs(
                adjacencyMatrix,
                transitiveClosure,
                i,
                k);
}

export function TransitiveClosure(
    adjacencyMatrix: boolean[][]
    ): boolean[][]
{
    const transitiveClosure = adjacencyMatrix.map(_ => adjacencyMatrix.map(_ => false));

    for(let i = 0; i < adjacencyMatrix.length; ++i)
        for(let j = 0; j < adjacencyMatrix.length; ++j)
            if(adjacencyMatrix[i][j])
                TransitiveClosureDfs(
                    adjacencyMatrix,
                    transitiveClosure,
                    i,
                    j);

    return transitiveClosure;
}

export function TransitiveClosure2<TVertex>(
    adjacencyMatrix: AdjacencyMatrix<TVertex>
    ): AdjacencyMatrix<TVertex>
{
    const keys = [...adjacencyMatrix.keys()];
    const transformedAdjacencyMatrix = keys.map(rowKey => keys.map(columnKey => adjacencyMatrix.get(rowKey).get(columnKey)));
    const transformedTransitiveClosure = TransitiveClosure(transformedAdjacencyMatrix);

    return new Map<TVertex, Map<TVertex, boolean>>(
        keys.map((rowKey, rowIndex) =>
            [
                rowKey,
                new Map<TVertex, boolean>(
                    keys.map((columnKey, columnIndex) =>
                        [
                            columnKey,
                            transformedTransitiveClosure[rowIndex][columnIndex]
                        ]))
            ]));
}
