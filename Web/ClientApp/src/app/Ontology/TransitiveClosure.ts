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
    const transitiveClosure: boolean[][] = [];
    for(let rowIndex = 0; rowIndex < adjacencyMatrix.length; ++rowIndex)
    {
        transitiveClosure[rowIndex] = [];
        for(let columnIndex = 0; columnIndex < adjacencyMatrix.length; ++columnIndex)
            transitiveClosure[rowIndex][columnIndex] = false;
    }

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
    const transformedAdjacencyMatrix: boolean[][] = [];
    for(let rowIndex = 0; rowIndex < keys.length; ++rowIndex)
    {
        const row: boolean[] = [];
        transformedAdjacencyMatrix[rowIndex] = row;
        for(let columnIndex = 0; columnIndex < keys.length; ++columnIndex)
            row[columnIndex] = adjacencyMatrix.get(keys[rowIndex]).get(keys[columnIndex]);
    }

    const transformedTransitiveClosure = TransitiveClosure(transformedAdjacencyMatrix);

    const transitiveClosure = new Map<TVertex, Map<TVertex, boolean>>(
        keys.map(key => [key, new Map<TVertex, boolean>(keys.map(key => [key, false]))]));

    for(let rowIndex = 0; rowIndex < keys.length; ++rowIndex)
    {
        const row = transitiveClosure.get(keys[rowIndex]);
        for(let columnIndex = 0; columnIndex < keys.length; ++columnIndex)
            row.set(
                keys[columnIndex],
                transformedTransitiveClosure[rowIndex][columnIndex]);
    }

    return transitiveClosure;
}
