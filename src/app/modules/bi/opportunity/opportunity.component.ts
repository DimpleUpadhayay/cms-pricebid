import { OnInit, Component } from '@angular/core';

declare var zingchart: any;
var myConfig;

@Component({
  selector: 'app-opportunity',
  templateUrl: './opportunity.component.html',
  styleUrls: ['./opportunity.component.css']
})

export class OpportunityComponent implements OnInit {

  regions = ["East", "West", "North", "South"]
  colours = ["blue", "yellow", "purple", "grey"];

  constructor() { }

  ngOnInit() {
    var originalConfig = {
      "type": "pie",
      "legend": {
        'highlight-plot': true
      },
      "title": {
        "text": "Total Opportunities"
      },
      "plot": {
        "detach": false,
        "cursor": "hande",
        "shadow": 8,
        "value-box": {
          "placement": "out",
          "text": "%t: %v (%npv%)",
          "border-radius": 5
        }
      },
      "tooltip": {
        "text": "%t: %v (%npv%)",
        "border-radius": 5
      },
      "series": [
        {
          "values": [148],
          "background-color": "red",
          "text": "Lost",
          "data-id": "vt"
        },
        {
          "values": [175],
          "background-color": "blue",
          "text": "Dropped",
          "data-id": "sp"
        },
        {
          "values": [159],
          "background-color": "green",
          "text": "Won",
          "data-id": "dt"
        },
        {
          "values": [131],
          "background-color": "orange",
          "text": "Live",
          "data-id": "st"
        }
      ],
      "shapes": [
        {
          'x': 25,
          'y': 20,
          'size': 10,
          'angle': -90,
          'type': 'triangle',
          'background-color': '#C4C4C4',
          'padding': 5,
          'cursor': 'hand',
          'id': 'backwards',
          'hover-state': {
            'border-width': 1,
            'border-color': '#000'
          }
        }
      ]
    }

    zingchart.render({
      id: 'myChart',
      data: originalConfig,
      height: '100%',
      width: '100%'
    });

    /**
 *  Secondary Charts
 */
    let drilldownConfig = {
      type: 'bar',
      title: {
        text: 'Security Tools'
      },
      plot: {
        "value-box": {
          // "placement": "out",
          "text": '%v',
          "border-radius": 5
        },
        tooltip: {
          text: '%v',
          borderWidth: '0px',
          fontSize: '18px',
          shadow: true,
          shadowAlpha: 0.5,
          shadowBlur: 2,
          shadowColor: '#c4c4c4',
          shadowDistance: 3
        },
        animation: {
          delay: 10,
          effect: 'ANIMATION_EXPAND_BOTTOM',
          method: 'ANIMATION_BACK_EASE_OUT',
          sequence: 'ANIMATION_BY_PLOT_AND_NODE',
          speed: '1200'
        }
      },
      plotarea: {
        margin: 'dynamic'
      },
      scaleX: {
        values: ['Firewall', 'Cache-control', 'Link-access', 'HTTP-Comp'],
        item: {
          color: '#555',
          fontSize: '12px',
          maxChars: 9
        },
        label: {
          text: 'Region',
          color: '#555',
          fontSize: '16px',
          fontWeight: 'none'
        },
        lineColor: '#555',
        tick: {
          lineColor: '#555'
        }
      },
      scaleY: {
        guide: {
          visible: false
        },
        item: {
          color: '#555',
          fontSize: '12px'
        },
        label: {
          text: 'No. of Bids',
          color: '#555',
          fontSize: '16px',
          fontWeight: 'none'
        },
        lineColor: '#555',
        tick: {
          lineColor: '#555'
        }
      },
      shapes: [
        {
          type: 'triangle',
          id: 'backwards',
          padding: '5px',
          angle: -90,
          backgroundColor: '#C4C4C4',
          cursor: 'hand',
          size: '10px',
          x: '20px',
          y: '20px'
        }
      ],
      series: [
        {
          values: [35, 15, 25, 10],
          styles: ['#1565C0', '#42A5F5', '#1E88E5', '#90CAF9']
        }
      ]
    };

    /**
     * Manage drilldown config
     */
    let drilldownDataStructure = {
      dt: {
        colors: this.colours,
        data: [20, 59, 61, 19],
        scaleLabels: this.regions,
        title: 'Won'
      },
      sp: {
        colors: this.colours,
        data: [60, 15, 42, 58],
        scaleLabels: this.regions,
        title: 'Dropped'
      },
      st: {
        colors: this.colours,
        data: [31, 25, 60, 15],
        scaleLabels: this.regions,
        title: 'Live'
      },
      vt: {
        colors: this.colours,
        data: [10, 52, 46, 40],
        scaleLabels: this.regions,
        title: 'Lost'
      }
    };


    /*
    * Built in zingchart API event used to capture node click events.
    * Starting from this scope you will handle drilldown functionality.
    */
    zingchart.node_click = function (p) {
      // You could use this data to help construct drilldown graphs check it out...
      if (drilldownDataStructure[p['data-id']]) {
        drilldownConfig['title']['text'] = drilldownDataStructure[p['data-id']]['title'];
        drilldownConfig['scaleX']['values'] = drilldownDataStructure[p['data-id']]['scaleLabels'];
        drilldownConfig['series'][0]['values'] = drilldownDataStructure[p['data-id']]['data'];
        drilldownConfig['series'][0]['styles'] = drilldownDataStructure[p['data-id']]['colors'];
        zingchart.exec('myChart', 'destroy');
        zingchart.render({
          id: 'drilldown1',
          data: drilldownConfig,
          height: '450px',
          width: '100%'
        });
      }
    }

    /*
    * Handle history buttons. You can assign
    * shapes id's and based on id you can go 
    * 'forward' or 'backwards'. You could 
    * also handle this with HTML and register
    * click events to those DOM elements.
    */
    zingchart.shape_click = function (p) {
      let shapeId = p.shapeid;

      switch (shapeId) {
        case 'forwards':
        case 'backwards':
        case 'default':
          zingchart.exec('drilldown1', 'destroy');
          zingchart.render({
            id: 'myChart',
            data: originalConfig,
            height: '450px',
            width: '100%'
          });
          break;
      }
    };



    // /**
    //  * Create associative array to manage drilldown config
    //  */
    // var drilldownDataStructure = [];
    // drilldownDataStructure["vt"] = {
    //   "series": [
    //     {
    //       "values": [48],
    //       "text": "East",
    //       "background-color": "#EF5350"
    //     },
    //     {
    //       "values": [50],
    //       "text": "West",
    //       "background-color": "#E53935"
    //     },
    //     {
    //       "values": [26],
    //       "text": "South",
    //       "background-color": "#C62828"
    //     },
    //     {
    //       "values": [24],
    //       "text": "North",
    //       "background-color": "#C62828"
    //     }
    //   ]
    // };
    // drilldownDataStructure["sp"] = {
    //   "series": [
    //     {
    //       "values": [15],
    //       "background-color": "#26A69A"
    //     },
    //     {
    //       "values": [5],
    //       "background-color": "#80CBC4"
    //     },
    //     {
    //       "values": [35],
    //       "background-color": "#00695C"
    //     },
    //     {
    //       "values": [20],
    //       "background-color": "#00897B"
    //     }
    //   ]
    // };
    // drilldownDataStructure["dt"] = {
    //   "series": [
    //     {
    //       "values": [20],
    //       "background-color": "#26C6DA"
    //     },
    //     {
    //       "values": [8],
    //       "background-color": "#80DEEA"
    //     },
    //     {
    //       "values": [35],
    //       "background-color": "#00838F"
    //     },
    //     {
    //       "values": [20],
    //       "background-color": "#00ACC1"
    //     }
    //   ]
    // };
    // drilldownDataStructure["st"] = {
    //   "series": [
    //     {
    //       "values": [35],
    //       "background-color": "#1565C0"
    //     },
    //     {
    //       "values": [15],
    //       "background-color": "#42A5F5"
    //     },
    //     {
    //       "values": [25],
    //       "background-color": "#1E88E5"
    //     },
    //     {
    //       "values": [10],
    //       "background-color": "#90CAF9"
    //     }
    //   ]
    // };
    // drilldownDataStructure["dm"] = {
    //   "series": [
    //     {
    //       "values": [10],
    //       "background-color": "#5E35B1"
    //     },
    //     {
    //       "values": [25],
    //       "background-color": "#4527A0"
    //     },
    //     {
    //       "values": [35],
    //       "background-color": "#7E57C2"
    //     }
    //   ]
    // };


    // /*
    // * Built in zingchart API event used to capture node click events.
    // * Starting from this scope you will handle drilldown functionality.
    // */
    // zingchart.node_click = function (p) {
    //   var plotIndex = p.plotindex;
    //   var scaleText = p.scaletext;

    //   // You could use this data to help construct drilldown graphs check it out...
    //   //console.log(p);
    //   if (drilldownDataStructure[p['data-id']]) {
    //     zingchart.exec('myChart', 'setseriesdata', {
    //       data: drilldownDataStructure[p['data-id']]['series']
    //     });
    //   }
    // }

    // /*
    // * Handle history buttons. You can assign
    // * shapes id's and based on id you can go 
    // * 'forward' or 'backwards'. You could 
    // * also handle this with HTML and register
    // * click events to those DOM elements.
    // */
    // zingchart.shape_click = function (p) {
    //   var shapeId = p.shapeid;
    //   //console.log(p);

    //   switch (shapeId) {
    //     case 'forwards':
    //     case 'backwards':
    //     case 'default':
    //       zingchart.exec('myChart', 'destroy');
    //       zingchart.render({
    //         id: 'myChart',
    //         data: originalConfig,
    //         height: '100%',
    //         width: '100%'
    //       });
    //       break;
    //   }
    // }
  }

  render() {
    zingchart.render({
      id: 'myChart',
      data: myConfig,
      height: 400,
      width: "100%"
    });
  }

}