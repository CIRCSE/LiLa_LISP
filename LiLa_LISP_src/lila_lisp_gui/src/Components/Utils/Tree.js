export default class  Tree  {
// Javascript implementation of the above approach
    v = [];
    path = []
// An utility function to add an edge in an
// undirected graph.
    addEdge(x, y) {
        this.v[x].push(y);
        this.v[y].push(x);
    }

// A function to print the path between
// the given pair of nodes.
    printPath(stack) {
        this.path = [...stack]
        console.log(stack);

    }

// An utility function to do
// DFS of graph recursively
// from a given vertex x.
    DFS(vis, x, y, stack) {
        // console.log("DFS");
        stack.push(x);
        if (x === y) {

            // Print the path and return on
            // reaching the destination node
            // this.printPath(stack)

            this.path = [...stack]
            this.path.pop()
            return
        }
        vis[x] = true;

        // If backtracking is taking place
        if (this.v[x].length > 0) {
            for (let j = 0; j < this.v[x].length; j++) {

                // If the node is not visited
                if (vis[this.v[x][j]] === false) {
                    this.DFS(vis, this.v[x][j], y, stack);
                }
            }
        }
        stack.pop();
    }

// A utility function to initialise
// visited for the node and call
// DFS function for a given vertex x.
    DFSCall(x, y, n, stack) {
        // Visited array
        // console.log("DFSCAll");
        let vis = new Array(n + 1);
        for (let i = 0; i < (n + 1); i++) {
            vis[i] = false;
        }

        // memset(vis, false, sizeof(vis))

        // DFS function call
        this.path = []
        this.DFS(vis, x, y, stack);
        return this.path
    }

}
