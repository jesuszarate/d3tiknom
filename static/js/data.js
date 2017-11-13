d3.json("data/monkit_data.json", function (error, data) {
    if (error) {
        throw error;
    }

    let navigator = new Navigator(data);
    d3.select("#loading-gif").remove();
});


let Globals = {
    // the number of data points checked in a target before the entire target
    // is determined to have null data
    NullDataCheckCount: 10,
};


function validDatapoint(datapoints) {
    let dataFound = false;
    let datapointsCount = datapoints.length;
    let offset = datapointsCount / Globals.NullDataCheckCount;

    // don't just check the first n datapoints, check n datapoints
    // dispersed throughout
    for (let j = 0; j < datapointsCount; j += offset) {
        // only include data in the table with actual values. null data has
        // {null}, {0}, or {1} in the 0th index
        if (datapoints[j][0] !== null && datapoints[j][0] > 1) {
            dataFound = true;
            break;
        }
    }
    return dataFound;
}


class navigationTree {
    constructor(data) {
        this.tree = this.addBranch(this.rootName());
        data.forEach(function(t) {
            if (!validDatapoint(t.datapoints)) {
                return;
            }

            let path = t.target.split(".");
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
            ptr["target"] = t.target;
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
            if (!validDatapoint(t.datapoints)) {
                continue;
            }

            this.data[t.target] = t.datapoints;
        }
        return this.data
    }
}
