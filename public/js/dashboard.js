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

    clearList(){
        this.divDashboard.selectAll("ul").remove();
    }

    addElements(parentDOM, data) {

        update(this, parentDOM, data);

        function update(ref, parentDom, data) {
            data.forEach(function (child) {
                //add li element
                parentDom.append("li")
                    .text(child.key)
                    .on("click", function (d) {
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

                if (child.children !== undefined) {
                    updateShowList(key, child.children);
                }
            });

        }
    }
}