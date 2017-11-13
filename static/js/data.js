d3.json("data/monkit_data.json", function (error, data) {
    if (error) {
        throw error;
    }

    let navigator = new Navigator(data);
    d3.select("#loading-gif").remove();
});


class navigationTree {
    constructor(data) {
        this.tree = this.addBranch(this.rootName());
        data.forEach(function(d) {
            let path = d.target.split(".");
            let ptr = this.tree; 
            for (let i = 0; i < path.length; i++) {
                let childProp = path[i];
                let position = path.slice(0, i + 1).join(".");
                if (ptr.hasOwnProperty(childProp)) {
                    // the child already exists. existing path. simply traverse
                    ptr = ptr[childProp];
                } else {
                    // the child needs to be added
                    this.addChildBranch(ptr, childProp);
                    ptr = ptr[childProp] = this.addBranch(position);
                }
            }
            ptr["target"] = d.target;
        }, this);
    }

    addBranch(branchName) {
        return {
            __meta__: {
                key: branchName,
                children: []
            }
        };
    }

    addChildBranch(ptr, branchName) {
        return ptr["__meta__"].children.push(branchName);
    }

    rootName() {
        return "navigationMenu";
    }

    root() {
        return this.tree;
    }

    nodeFromKey(pathStr) {
        pathStr = pathStr.replace(this.rootName(), "");

        let path = pathStr.split(".");
        let ptr = this.tree; 
        for (let i = 0; i < path.length; i++) {
            let childProp = path[i];
            if (childProp === "") {
                continue;
            }

            if (ptr.hasOwnProperty(childProp)) {
                ptr = ptr[childProp];
            } else {
                throw "can't find path in tree";
            }
        }
        return ptr;
    }

    childrenFromKey(pathStr) {
        return this.nodeFromKey(pathStr)["__meta__"].children;
    }
}


class dataTable {
    constructor(data) {
        this.data = {};
        for (let i = 0; i < data.length; i++) {
            let t = data[i];
            this.data[t.target] = t.datapoints;
        }
        return this.data
    }
}
