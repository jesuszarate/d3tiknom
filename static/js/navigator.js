class Navigator {
    constructor(data) {
        this.data = new dataTable(data);
        this.dataTree = new navigationTree(data);

        // initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        this.divNavigator = d3.select("#navigator");

        this.selectedPaths = [this.dataTree.rootName()];
        this.selectedTargets = [];
        this.update(this.divNavigator, this.dataTree.tree);

        this.Plots = new Plots(this.data);
    }

    clear() {
        this.divNavigator.selectAll("ul").remove();
    }

    // add or remove selected element from selections list
    updateSelectedPaths(selection) {
        let index = this.selectedPaths.indexOf(selection);
        if (index > -1) {
            this.selectedPaths.splice(index, 1);
        } else {
            this.selectedPaths.push(selection);
        }
    }

    // add or remove selected element from selections list
    updateSelectedTargets(selection) {
        let index = this.selectedTargets.indexOf(selection);
        if (index > -1) {
            this.selectedTargets.splice(index, 1);
        } else {
            this.selectedTargets.push(selection);
        }
    }

    // recursively updates the treenode list, expanding paths that exist in the
    // selectedPaths list
    update(parentElement, treeNode) {
        let unusedLeaf = true;
        for (let i = 0; i < this.selectedPaths.length; i++) {
            let s = this.selectedPaths[i];
            if (s.includes(treeNode["__meta__"].key)) {
                unusedLeaf = false;
                break;
            }
        }
        
        // the current treeNode doesn't exist in the selectedPaths, so there
        // is no point continuing recursing through the branch
        if (unusedLeaf) {
            return;
        }

        let children = treeNode["__meta__"].children;
        if (children.length === 0) {
            return;
        }

        let ul = parentElement
            .append("ul")
            .attr("class", "nav nav-pills flex-column");

        let ref = this;
        children.forEach(function(child) {
            let li = ul
                .append("li")
                .attr("class", "nav-item");

            li.append("a")
                .attr("class", "nav-link")
                .text(child)
                .attr("id", treeNode[child]["__meta__"].key)
                .on("click", function () {
                    let ele = d3.select(this);
                    let name = ele.text();
                    let key = ele.node().id;
                    ref.clear();
                    ref.updateSelectedPaths(key);
                    ref.update(ref.divNavigator, ref.dataTree.tree);
                    let node = ref.dataTree.nodeFromKey(key);
                    if (node.hasOwnProperty("target")) {
                        ref.updateSelectedTargets(key);
                        ref.Plots.update(ref.selectedTargets);
                    }
                });

            let childKey = treeNode[child]["__meta__"].key;
            if (ref.selectedPaths.includes(childKey)) {
                // the child element has been selected, so continue recursing
                ref.update(li, treeNode[child]);
            }
        });
    }
}
