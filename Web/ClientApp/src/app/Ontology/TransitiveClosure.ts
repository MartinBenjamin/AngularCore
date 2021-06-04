type AdjacencyMatrix<TVertex> = Map<TVertex, Map<TVertex, boolean>>;

export function TransitiveClosure(
    adjacencyMatrix: boolean[][]
    ): boolean[][]
{
    const transitiveClosure: boolean[][] = [];
    for(let rowIndex = 0; rowIndex < adjacencyMatrix.length; ++rowIndex)
        transitiveClosure[rowIndex] = [...adjacencyMatrix[rowIndex]];

    //for(let k = 0; k < adjacencyMatrix.length; ++k)
    //    for(let i = 0; i < adjacencyMatrix.length; ++i)
    //        for(let j = 0; j < adjacencyMatrix.length; ++j)
    //            transitiveClosure[i][j] = transitiveClosure[i][j] || (transitiveClosure[i][k] && transitiveClosure[k][j]);

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
    input: AdjacencyMatrix<TVertex>
    ): AdjacencyMatrix<TVertex>
{
    const keys = [...input.keys()];
    let matrix: boolean[][] = [];
    for(let rowIndex = 0; rowIndex < keys.length; ++rowIndex)
    {
        const row: boolean[] = [];
        matrix[rowIndex] = row;
        for(let columnIndex = 0; columnIndex < keys.length; ++columnIndex)
            row[columnIndex] = input.get(keys[rowIndex]).get(keys[columnIndex]);
    }

    matrix = TransitiveClosure(matrix);

    var result = new Map<TVertex, Map<TVertex, boolean>>();
    for(let rowIndex = 0; rowIndex < keys.length; ++rowIndex)
    {
        const row = new Map<TVertex, boolean>();
        result.set(
            keys[rowIndex],
            row);
        for(let columnIndex = 0; columnIndex < keys.length; ++columnIndex)
            row.set(
                keys[columnIndex],
                matrix[rowIndex][columnIndex]);
    }

    return result;
}

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
