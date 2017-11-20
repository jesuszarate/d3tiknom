// Navigator generates all of the navigation elements
class Navigator {
    constructor(data) {
        this.plotIds = ["#box-plot", "#stack-trace-plot", "#comparison-plot",
            "#dot-plot"];

        this.data = new dataTable(data);
        this.dataTree = new navigationTree(data);
        this.Plots = new Plots(this.plotIds, this.data);

        // initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        this.divNavigator = d3.select("#navigator");

        this.selectedPaths = [this.dataTree.rootName()];
        this.selectedGubbins = [];
        this.update(this.divNavigator, this.dataTree.tree);

        let ref = this;
        d3.select("#plot-clearer").on("click", function() {
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
            let selectionIdx = ref.selectedGubbins.indexOf(childKey);
            if (selectionIdx > -1) {
                aClass += " selected-target gubbin-selected-" + selectionIdx;
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
        d3.selectAll(".target-selectors")
            .selectAll(".target-selector-group")
            .remove();

        let ref = this;
        for (let i = 0; i < ref.selectedGubbins.length; i++) {
            let gub = ref.dataTree.nodeFromKey(ref.selectedGubbins[i]);
            let metrics = gub["__meta__"].children;
            let targetGroup = d3.selectAll(".target-selectors")
                .append("div")
                .attr("class", "target-selector-group gubbin-selected-" + i)
                .attr("x-gubbin", gub.gubbin);
            let metricSelect = targetGroup
                .append("select")
                .attr("class", "metric-target-selector");
            metricSelect.selectAll("option")
                .data(metrics)
                .enter()
                .append("option")
                .attr("value", (d) => d)
                .text((d) => d);
            metricSelect.select("option")
                .attr("selected", "selected");
            metricSelect.on("change", function() { ref.sendTargetToPlots(); });
            let ids = []
            for (let j = 0; j < metrics.length; j++) {
                let met = ref.dataTree.keyFromGubbinMetric(gub, metrics[i]);
                let gubMet = ref.dataTree.nodeFromKey(met);
                gubMet["__meta__"].children.forEach(function(d) {
                    if (!ids.includes(d)) { ids.push(d); }
                });
            }

            let idSelect = targetGroup
                .append("select")
                .attr("class", "id-target-selector");
            idSelect.selectAll("option")
                .data(ids)
                .enter()
                .append("option")
                .attr("value", (d) => d)
                .text((d) => d.trunc(10));
            idSelect.select("option")
                .attr("selected", "selected");
            idSelect.on("change", function() { ref.sendTargetToPlots(); });
        }

        this.sendTargetToPlots();
    }

    sendTargetToPlots() {
        let selectedTargets = {};
        this.plotIds.forEach(function(plotId) {
            selectedTargets[plotId] = [];
        });

        this.plotIds.forEach(function(plotId) {
            d3.select(plotId).selectAll(".target-selector-group")
                .each(function() {
                    let d = d3.select(this);
                    let metric = d.select(".metric-target-selector")
                        .node().value;
                    let id = d.select(".id-target-selector")
                        .node().value;
                    let target = d.node().getAttribute("x-gubbin") + "." +
                        metric + "." + id;
                    selectedTargets[plotId].push(target);
                });
        });

        this.Plots.clearPlots();
        this.Plots.update(selectedTargets);
    }
}

String.prototype.trunc = String.prototype.trunc || function(n) {
  return (this.length > n) ? this.substr(0, n-1) + '...' : this;
};
