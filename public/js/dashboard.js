class Dashboard {
    constructor(data) {
        this.data = data;

        // Initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        this.divDashboard = d3.select("#dashboard").classed("fullView", true);

        this.listData = []
        // //fetch the svg bounds
        // this.svgBounds = this.divDashboard.node().getBoundingClientRect();
        // this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        // this.svgHeight = 100;
        //
        // //add the svg to the div
        // this.svg = this.divDashboard.append("svg")
        //     .attr("width", this.svgWidth)
        //     .attr("height", this.svgHeight);

    }

    update() {

        let ref = this;
        this.divDashboard.selectAll("ul").remove();

        let lu = this.divDashboard.append("ul")
            .attr("class", "noBullet");

        let li = lu.selectAll("li")
            .data([this.data]);

        li.enter()
            .append("li")
            .text(function (d) {
                //return Object.keys(d)[0];
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
                        ref.listData.push({"key": d["key"], "children": d["children"], "show": false})
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
                            .attr("class", "noBullet");
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
                    if (child.datapoints.length > 0 && child.datapoints[0][0] != null) {
                        ref.buildTimePlot(child);
                    }
                }
            });

        }
    }



    buildTimePlot(data) {
        let margin = {top: 20, left: 70, bottom: 70, right: 20};
        d3.select("#barchartSvg").attr("transform", "translate(" +
            margin.left + "," + margin.top + ")");

        let barchartSvg = d3.select("#barChart");
        let chartWidth = +barchartSvg.attr("width") - margin.left - margin.right;
        let chartHeight = +barchartSvg.attr("height") - margin.top - margin.bottom;

        // create the x and y scales; make sure to leave room for the axes
        let xScale = d3.scaleBand()
            .domain(data.datapoints.map((d) => d[1]))
            .rangeRound([chartWidth, 0])
            .padding(0.1);

        let yScale = d3.scaleLinear()
            .domain([0, d3.max(data.datapoints, d => d[0])])
            .rangeRound([chartHeight, 0]);

        // create the bars
        var bars = d3.select("#bars")
            .selectAll("rect")
            .data(data.datapoints);

        bars.exit()
            .transition()
            .duration(this.durationTimeMs)
            .attr("height", 0)
            .remove();

        var newBcSelection = bars.enter().append("rect");
        newBcSelection
            .transition()
            .duration(0)
            .attr("x", function(d) { return xScale(d[1]); });

        var bcSelection = newBcSelection.merge(bars);
        bcSelection
            .transition()
            .duration(this.durationTimeMs)
            .attr("x", function (d) { return xScale(d[1]); })
            .attr("y", function (d) { return yScale(d[0]); })
            .attr("fill", "444")
            .attr("width", xScale.bandwidth())
            .attr("height", function (d) {
              return chartHeight - yScale(d[0]);
            });

    }
}
