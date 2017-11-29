// from https://stackoverflow.com/a/901144
function getParameterByName(name) {
    let url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    let results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

String.prototype.trunc = String.prototype.trunc || function(n) {
  return (this.length > n) ? this.substr(0, n-1) + '...' : this;
};

// Navigator generates all of the navigation elements
class Navigator {
    constructor(data) {
        this.data = new dataTable(data);
        this.dataTree = new navigationTree(data);
        this.colorKeys = new colorKeys(data);

        this.colorScale = d3.scaleOrdinal()
            .domain([this.colorKeys.min, this.colorKeys.max])
            .range(d3.schemeCategory10);

        this.Plots = new Plots(this.data, this.colorKeys, this.colorScale);

        // initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        this.divNavigator = d3.select("#navigator");
        this.scrollSpots = d3.select("nav.sidebar").node();

        this.selectedPaths = [this.dataTree.rootName()];
        this.selectedGubbins = [];

        this.lastYScrollPosition = 0;
        this.lastXScrollPosition = 0;

        let preselection = getParameterByName("gubbin");
        if (preselection !== null && preselection !== "") {
            let levels = preselection.split(".");
            levels.forEach(function(_, i) {
                let path = levels.slice(0, i).join(".");
                if (path !== "") {
                    this.selectedPaths.push(path);
                }
            }, this);
            this.selectedGubbins.push(preselection);
        }

        this.update(this.divNavigator, this.dataTree.tree);
        this.updatePlotSelectors();

        let ref = this;
        d3.select("#plot-clearer").on("click", function() {
            ref.selectedGubbins = [];
            ref.Plots.clearPlots();
            ref.clear();
            ref.update(ref.divNavigator, ref.dataTree.tree);
            ref.updatePlotSelectors();
        });

        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        d3.selectAll(".legend").on("mousedown", function() {
            let elmnt = d3.select(this).node();
            let eo = d3.event;
            // get the mouse cursor position at startup
            pos3 = eo.clientX;
            pos4 = eo.clientY;

            // call a function whenever the cursor moves
            d3.selection().on("mousemove", function() {
                let e = d3.event;
                // calculate the new cursor position
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                // set the element's new position
                elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
                elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
            });

            d3.selection().on("mouseup", function() {
                d3.selection().on("mouseup", null);
                d3.selection().on("mousemove", null);
            });
        });
    }

    clear() {
        this.lastYScrollPosition = this.scrollSpots.scrollTop;
        this.lastXScrollPosition = this.scrollSpots.scrollLeft;
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
                aClass += " selected-target gubbin-selected";
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
                    }
                    ref.updateSelectedPaths(key);
                    ref.update(ref.divNavigator, ref.dataTree.tree);
                    if (node.hasOwnProperty("gubbin")) {
                        ref.updatePlotSelectors();
                    }
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
            .selectAll("tr")
            .remove();

        this.scrollSpots.scrollTop = this.lastYScrollPosition;
        this.scrollSpots.scrollLeft = this.lastXScrollPosition;

        let ref = this;
        for (let i = 0; i < ref.selectedGubbins.length; i++) {
            let gub = ref.dataTree.nodeFromKey(ref.selectedGubbins[i]);
            let metrics = gub["__meta__"].children;
            let targetGroup = d3.selectAll(".target-selectors")
                .append("tr")
                .attr("class", "target-selector-group gubbin-selected")
                .style("background-color",
                    ref.colorScale(ref.colorKeys.data[gub.gubbin]))
                .attr("x-gubbin", gub.gubbin);

            let gubParts = gub.gubbin.split(".");
            targetGroup.append("td")
                .text(gubParts[gubParts.length - 1]);

            let metricSelect = targetGroup
                .append("td")
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
                let met = ref.dataTree.keyFromGubbinMetric(gub, metrics[j]);
                let gubMet = ref.dataTree.nodeFromKey(met);
                gubMet["__meta__"].children.forEach(function(d) {
                    if (!ids.includes(d)) { ids.push(d); }
                });
            }

            let idSelect = targetGroup
                .append("td")
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
        d3.selectAll(".graph-group")
            .each(function() {
                let plotId = "#" + d3.select(this).node().getAttribute("id");
                selectedTargets[plotId] = [];
            });
        let plotIds = Object.keys(selectedTargets);

        plotIds.forEach(function(plotId) {
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
