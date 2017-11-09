class Dashboard {
    constructor(data) {
        this.data = data;

        // Initializes the svg elements required for this chart
        this.margin = {top: 10, right: 20, bottom: 30, left: 50};
        this.divDashboard = d3.select("#dashboard").classed("fullView", true);

        //fetch the svg bounds
        this.svgBounds = this.divDashboard.node().getBoundingClientRect();
        this.svgWidth = this.svgBounds.width - this.margin.left - this.margin.right;
        this.svgHeight = 100;

        //add the svg to the div
        this.svg = this.divDashboard.append("svg")
            .attr("width", this.svgWidth)
            .attr("height", this.svgHeight);

    }

    update() {

        this.divDashboard.selectAll("ul").remove();

        let lu = this.divDashboard.append("ul")
            .attr("class", "noBullet");

        let li = lu.selectAll("li")
            .data([this.data]);

        li.enter()
            .append("li")
            .text(function (d) {
                return Object.keys(d)[0];
            })
            .attr("id", function (d) {
                return Object.keys(d)[0];
            })
            .on("click", function (d) {
                let key = Object.keys(d)[0];

                let keys = Object.keys(d[key]);

                let data = [];
                for (let k in keys){

                    data.push(d[key][keys[k]]);
                }

                let lu1 = lu.append("ul")
                    .attr("class", "noBullet");

                let li1 = lu1.selectAll("li")
                    .data(data);

                li1.enter()
                    .append("li")
                    .text(function (d) {
                        return Object.keys(d)[0];
                    })
                    .attr("id", function (d) {
                        return Object.keys(d)[0];
                    })
                    .on("click", function (d) {
                        alert(Object.keys(d)[0]);
                    });
            });


    }
}