let overview;

d3.json("data/monkit_data.json", function (error, data) {
    if (error) {
        throw error;
    }

    try {
        let navigator = new Navigator(data);
    } catch (_) {}

    try {
        overview = new Overview(data);
        overview.update("tiles");
    } catch (_) {}

    d3.select("#loading-gif").remove();
});

function viewType(type){
    overview.update(type)
}


// variables that are globally available
let Globals = {
    // the number of data points checked in a target before the entire target
    // is determined to have null data
    NullDataCheckCount:   20,
    WhitelistedInterests: ["successes", "errors", "failures", "total"],
};


// validates the raw datapoints
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

// indicates that the target is a data type we're interested in.
function interestedInTarget(target) {
    return true;
    for (let i = 0; i < Globals.WhitelistedInterests.length; i++) {
        let ist = "." + Globals.WhitelistedInterests[i] + ".";
        if (target.indexOf(ist) > -1) {
            return true;
        }
    }
    return false;
}


class navigationTree {
    constructor(data) {
        this.tree = this.addBranch(this.rootName());
        data.forEach(function(t) {
            if (!validDatapoint(t.datapoints)) {
                return;
            }

            if (!interestedInTarget(t.target)) {
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

                // the actual gubbin we want to display is always 2 up from the
                // leaf most nodes, but the ptr already moved down 1, so go
                // back 3
                if (i == path.length - 3) {
                    ptr["gubbin"] = position;
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
                throw "can't find path: <" + childProp + "> in tree: " + ptr.tree;
            }
        }
        return ptr;
    }

    keyFromGubbinMetric(gubbin, metric) {
        return [gubbin["__meta__"].key, metric].join(".");
    }

    targetFromGubbinMetricId(gubbin, metric, id) {
        return [gubbin["__meta__"].key, metric, id].join(".");
    }

    childrenFromKey(pathStr) {
        return this.nodeFromKey(pathStr)["__meta__"].children;
    }
}

function gubbinFromTarget(target) {
    let parts = target.split(".");
    return parts.splice(0, parts.length - 2).join(".");
}

function nameFromTarget(target) {
    let parts = target.split(".");
    return parts[parts.length - 3];
}

class dataTable {
    constructor(data) {
        this.data = {};
        for (let i = 0; i < data.length; i++) {
            let t = data[i];
            if (!validDatapoint(t.datapoints)) {
                continue;
            }

            if (!interestedInTarget(t.target)) {
                continue;
            }

            this.data[t.target] = t.datapoints;
        }
        return this.data;
    }
}


class colorKeys {
    constructor(data) {
        this.data = {};
        this.min = 0;
        this.max = 0;
        for (let i = this.min; i < data.length; i++) {
            let t = data[i];
            if (!validDatapoint(t.datapoints)) {
                continue;
            }

            if (!interestedInTarget(t.target)) {
                continue;
            }

            let gubbin = gubbinFromTarget(t.target);
            if (this.data.hasOwnProperty(gubbin)) {
                continue;
            }

            this.data[gubbin] = this.max;
            this.max++;
        }
    }
}
