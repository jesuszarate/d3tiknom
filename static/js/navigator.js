class Navigator {
    constructor(data) {
        this.data = new dataTable(data);
        this.dataTree = new navigationTree(data);
        this.Plots = new Plots(this.data);

        // initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        this.divNavigator = d3.select("#navigator");

        this.selectedPaths = [this.dataTree.rootName()];
        this.selectedGubbins = [];
        this.update(this.divNavigator, this.dataTree.tree);

        let ref = this;
        d3.select("#plot-clearer") .on("click", function() {
            ref.selectedGubbins = [];
            ref.Plots.clearPlots();
            ref.clear();
            ref.update(ref.divNavigator, ref.dataTree.tree);
            ref.updatePlotSelectors();
        });
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
    updateSelectedGubbins(selection) {
        let index = this.selectedGubbins.indexOf(selection);
        if (index > -1) {
            this.selectedGubbins.splice(index, 1);
        } else {
            this.selectedGubbins.push(selection);
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

            let childKey = treeNode[child]["__meta__"].key;
            let aClass = "nav-link";
            if (ref.selectedGubbins.includes(childKey)) {
                aClass += " selected-target";
            }

            li.append("a")
                .attr("class", aClass)
                .text(child)
                .attr("id", childKey)
                .on("click", function () {
                    let ele = d3.select(this);
                    let name = ele.text();
                    let key = ele.node().id;
                    ref.clear();
                    let node = ref.dataTree.nodeFromKey(key);
                    if (node.hasOwnProperty("gubbin")) {
                        ref.updateSelectedGubbins(key);
                        ref.updatePlotSelectors();
                    }
                    ref.updateSelectedPaths(key);
                    ref.update(ref.divNavigator, ref.dataTree.tree);
                });

            if (ref.selectedPaths.includes(childKey)) {
                let node = ref.dataTree.nodeFromKey(childKey);
                if (node.hasOwnProperty("gubbin")) {
                    // don't recurse if the element is a gubbin
                    return;
                }

                // the child element has been selected, so continue recursing
                ref.update(li, treeNode[child]);
            }
        });
    }

    updatePlotSelectors() {
        d3.selectAll(".target-selectors").selectAll("input").remove();
        d3.selectAll(".target-selectors").selectAll("select").remove();

        for (let i = 0; i < this.selectedGubbins.length; i++) {
            let gub = this.dataTree.nodeFromKey(this.selectedGubbins[i]);
            let metrics = gub["__meta__"].children;
            d3.selectAll(".target-selectors")
                .append("select")
                .selectAll("option")
                .data(metrics)
                .enter()
                .append("option")
                .attr("value", (d) => d)
                .text((d) => d);
            let ids = []
            for (let j = 0; j < metrics.length; j++) {
                let met = this.dataTree.keyFromGubbinMetric(gub, metrics[i]);
                let gubMet = this.dataTree.nodeFromKey(met);
                gubMet["__meta__"].children.forEach(function(d) {
                    if (!ids.includes(d)) { ids.push(d); }
                });

            }

            d3.selectAll(".target-selectors")
                .append("select")
                .selectAll("option")
                .data(ids)
                .enter()
                .append("option")
                .attr("value", (d) => d)
                .text((d) => d);
        }
        //this.Plot.update("something");
    }
}
