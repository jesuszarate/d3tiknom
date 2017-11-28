class Overview {
    constructor(data) {
        this.data = new dataTable(data);

        Object.keys(this.data).forEach(function(d) {
          if (d.indexOf(".total") > -1) {
            let datapoint = this.data[d];
            console.log(d, datapoint[datapoint.length - 1][0]);
          }

          if (d.indexOf(".successes") > -1) {
            let datapoint = this.data[d];
            console.log(d, datapoint[datapoint.length - 1][0]);
          }
        }, this);
    }
}
