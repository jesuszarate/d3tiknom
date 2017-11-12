class Dashboard {
    constructor(data) {
        this.data = data;

        // initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        this.divDashboard = d3.select("#dashboard");
        this.listData = []

        let ref = this;
        this.divDashboard.selectAll("ul").remove();

        let lu = this.divDashboard.append("ul")
            .attr("class", "nav nav-pills flex-column");

        let li = lu.selectAll("li")
            .data([this.data]);

        li.enter()
            .append("li")
            .attr("class", "nav-item")
            .append("a")
            .attr("class", "nav-link")
            .text(function (d) {
                return d[0].key;
            })
            .attr("id", function (d) {
                return Object.keys(d)[0];
            })
            .on("click", function (d) {
                ref.updateElements(lu, [ref.data]);
            });
    }

    updateElements(parentDom, data) {
        parentDom.selectAll("li").remove();
        let ref = this;

        data.forEach(function (k) {
            k.forEach(function (d) {
                d["children"].forEach(function (k) {
                    k.forEach(function (d) {
                        ref.listData.push({
                            "key": d["key"],
                            "children": d["children"],
                            "show": false
                        })
                    });
                });
            });
        });

        ref.addElements(parentDom, this.listData)
    }

    clearList() {
        this.divDashboard.selectAll("ul").remove();
    }

    addElements(parentDOM, data) {
        let ref = this;
        update(ref, parentDOM, data);

        function update(ref, parentDom, data) {
            data.forEach(function (child) {
                //add li element
                parentDom.append("li")
                    .attr("class", "nav-item")
                    .append("a")
                    .attr("class", "nav-link")
                    .text(function () {
                            if (child.key === undefined){
                                return child.target;
                            }
                            return child.key;
                        }
                    )
                    .on("click", function () {
                        updateShowList(this.innerText, data);
                        //parentDom.selectAll("li").remove();
                        ref.clearList();
                        parentDom = ref.divDashboard.append("ul")
                            .attr("class", "nav nav-pills flex-column");
                        ref.addElements(parentDom, ref.listData);
                    });
                // //if children then make ul
                if (child.show === true && child.children.length > 0) {
                    var ul = parentDom.append("ul");
                    update(ref, ul, child.children[0]);
                }
            });
        }

        function updateShowList(key, data) {
            data.forEach(function (child) {
                if (child.key === key) {
                    child.show = !child.show;
                    return;
                }

                if (child.hasOwnProperty('children')) {
                    updateShowList(key, child.children);
                }

                if (child.hasOwnProperty('target') && child.target === key) {
                    if (child.datapoints.length > 0 &&
                        child.datapoints[0][0] != null) {
                        ref.buildTimePlot(child);
                    }
                }
            });
        }
    }

    buildTimePlot(data) {
        let margin = {top: 20, left: 70, bottom: 70, right: 20};

        let plotIds = ["#box-plot", "#stack-trace-plot", "#comparison-plot",
            "#dot-plot"];

        plotIds.forEach(function(plotId) {
            let barchartSvg = d3.select(plotId);
            let computedSize = barchartSvg.node().getBoundingClientRect();
            let chartWidth = computedSize.width - margin.left -
                margin.right;
            let chartHeight = computedSize.height - margin.top -
                margin.bottom;

            barchartSvg.select(".svg-plot").attr("transform", "translate(" +
                margin.left + "," + margin.top + ")");


            // create the x and y scales; make sure to leave room for the axes
            let xScale = d3.scaleBand()
                .domain(data.datapoints.map((d) => d[1]))
                .rangeRound([chartWidth, 0])
                .padding(0.1);

            let yScale = d3.scaleLinear()
                .domain([0, d3.max(data.datapoints, d => d[0])])
                .rangeRound([chartHeight, 0]);

            // create the bars
            var bars = barchartSvg.select(".bars")
                .selectAll("rect")
                .data(data.datapoints);

            bars.exit()
                .attr("height", 0)
                .remove();

            var newBcSelection = bars.enter().append("rect");
            newBcSelection
                .transition()
                .duration(0)
                .attr("x", function(d) { return xScale(d[1]); });

            var bcSelection = newBcSelection.merge(bars);
            bcSelection
                .attr("x", function (d) { return xScale(d[1]); })
                .attr("y", function (d) { return yScale(d[0]); })
                .attr("fill", "444")
                .attr("width", xScale.bandwidth())
                .attr("height", function (d) {
                  return chartHeight - yScale(d[0]);
                });
        });
    }
}
