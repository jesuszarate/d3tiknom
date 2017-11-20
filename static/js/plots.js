class Plots {
    constructor(plotIds, data) {
        this.data = data;

        // initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};

        this.plotIds = plotIds;
    }

    update(selectedTargets) {
        console.log(selectedTargets);
        let plotTargets = selectedTargets["#dot-plot"];
        let targets = [];
        for (let i = 0; i < plotTargets.length; i++) {
            targets.push(this.data[plotTargets[i]]);
        }

        if (targets.length === 0) {
            this.clearPlots();
        } else {
            this.buildTimePlot(targets[0]);
        }
    }

    clearPlots() {
        this.plotIds.forEach(function(plotId) {
            let bars = d3.select(plotId)
                .select(".bars")
                .selectAll("rect")
                .remove();
        });
    }

    buildTimePlot(target) {
        let ref = this;
        this.plotIds.forEach(function(plotId) {
            let barchartSvg = d3.select(plotId);
            let computedSize = barchartSvg.node().getBoundingClientRect();
            let chartWidth = computedSize.width - ref.margin.left -
                ref.margin.right;
            let chartHeight = computedSize.height - ref.margin.top -
                ref.margin.bottom;

            barchartSvg.select(".svg-plot").attr("transform", "translate(" +
                ref.margin.left + "," + ref.margin.top + ")");

            // create the x and y scales; make sure to leave room for the axes
            let xScale = d3.scaleBand()
                .domain(target.map((d) => d[1]))
                .rangeRound([chartWidth, 0])
                .padding(0.1);

            let yScale = d3.scaleLinear()
                .domain([0, d3.max(target, d => d[0])])
                .rangeRound([chartHeight, 0]);

            // create the bars
            let bars = barchartSvg.select(".bars")
                .selectAll("rect")
                .data(target);

            bars.exit()
                .attr("height", 0)
                .remove();

            let newBcSelection = bars.enter().append("rect");
            newBcSelection
                .transition()
                .duration(0)
                .attr("x", function(d) { return xScale(d[1]); });

            let bcSelection = newBcSelection.merge(bars);
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
