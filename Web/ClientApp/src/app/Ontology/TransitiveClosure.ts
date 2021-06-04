type AdjacencyMatrix<TVertex> = Map<TVertex, Map<TVertex, boolean>>;

export function TransitiveClosure(
    input: boolean[][]
    ): boolean[][]
{
    const result: boolean[][] = [];
    for(let rowIndex = 0; rowIndex < input.length; ++rowIndex)
        result[rowIndex] = [...input[rowIndex]];

    //for(let k = 0; k < input.length; ++k)
    //    for(let i = 0; i < input.length; ++i)
    //        for(let j = 0; j < input.length; ++j)
    //            result[i][j] = result[i][j] || (result[i][k] && result[k][j]);

    for(let i = 0; i < input.length; ++i)
        for(let j = 0; j < input.length; ++j)
            if(input[i][j])
                TransitiveClosureDfs(
                    input,
                    result,
                    i,
                    j);

    return result;
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
    input            : boolean[][],
    transitiveClosure: boolean[][],
    i                : number,
    j                : number
    )
{
    transitiveClosure[i][j] = true;
    for(let index = 0; index < input[j].length; ++index)
        if(input[j][index] && !transitiveClosure[i][index])
            TransitiveClosureDfs(
                input,
                transitiveClosure,
                i,
                index);
}
