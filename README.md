# D3-Kagi

**D3-Kagi** is an open-source JavaScript library for rendering Kagi charts using the D3.js library.

The Kagi chart is a chart used for tracking price movements and to make decisions on purchasing stock.
It is one of the various charts that investors use to make better decisions about stocks. The most important benefit of this chart is that it is independent of time and change of direction occurs only when a specific amount is reached.
It was originally developed in Japan during the 1870s when the Japanese stock market started trading. It was used for tracking the price movement of rice and found use in determining the general levels of supply and demand for certain assets.

Check out an [Example](https://arpitnarechania.github.io/d3-kagi/) where you can test various configuration options.

# Installation

Download d3-kagi using bower.

```
bower install d3-kagi --save
```

To use this library then, simply include d3.js, jquery, kagi.js and kagi.css:

``` html
<script src="/path/to/d3.min.js"></script>
<script src="/path/to/jquery.min.js"></script>
<script src="/path/to/dist/kagi.css"></script>
<script src="/path/to/dist/kagi.js"></script>
```

# Usage

To use this library, you must create a container element and instantiate a new
Kagi chart:

```html
<div id="kagiChart"></div>
```

Data in .json format
``` javascript
var data = [
  {
    "date": "2015-01-02",
    "close": 109.33
  },
  {
    "date": "2015-01-05",
    "close": 106.25
  },
  {
    "date": "2015-01-06",
    "close": 106.26
  }];
```

Setting chart parameters
``` javascript

    var chart_options = {
        "caption": "Caption",
        "subCaption": "Sub caption",
        "reversalValue": 25,
        "reversalType": "diff",
        "unit": "$",
        "isPrecedingUnit":true,
        "rallyThickness": "3",
        "rallyThicknessOnHover": "6",
        "declineThickness": "2",
        "declineThicknessOnHover": "4",
        "rallyColor": "#2ecc71",
        "declineColor": "#e74c3c",
        "width":900,
        "height":500,
        "margin":{top: 75, right: 50, bottom: 100, left: 50},
        "showBreakPoints":true,
        "showBreakPointText":true,
        "breakPointColor":"#3498db",
        "breakPointRadius":5,
        "breakPointRadiusOnHover":8,
        "showBreakPointTooltips":true,
        "showRangeTooltips":true,
        "showLegend":true,
        "chartTheme":"dark",
        "showAnimation":true,
        "animationDurationPerTrend":100,
        "animationEase":"linear"
        }

    KagiChart(data,chart_options);

```

## Options

| Option                     | Description                                                               | Type     | Options
| -------------------------- | ------------------------------------------------------------------------- | -------- | -------------------------     |
| `width`                    | The width of the chart in pixels                                          | number   | `900`                         |
| `height`                   | The height of the chart in pixels                                         | number   | `500`                         |
| `margin.top`               | The top margin                                                            | number   | `75`                          |
| `margin.bottom`            | The bottom margin                                                         | number   | `50`                          |
| `margin.left`              | The left margin                                                           | number   | `100`                         |
| `margin.right`             | The right margin                                                          | number   | `50`                          |
| `showLegend`               | Whether the legend is to be shown.                                        | bool     | `true`                        |
| `caption`                  | The chart caption.                                                        | string   | `'Caption'`                   |
| `subCaption`               | The chart sub-caption                                                     | string   | `'Sub Caption'`               |
| `chartTheme`               | Some themes for the chart rendering                                       | string   | `'light'` (default), `'dark'` |
| `reversalType`             | The basis on which the Kagi trend must reverse - difference or percentage | string   | `'diff'` (default), `'pct'`   |
| `reversalValue`            | The reversal value based on which the Kagi trend must reverse             | number   | `0.25`                        |
| `rallyColor`               | The color of the Yang lines                                               | string   | `'green'`                     |
| `rallyThickness`           | The thickness of the Yang lines                                           | number   | `3`                           |
| `rallyThicknessOnHover`    | The thickness of the Yang lines when hovered upon                         | number   | `5`                           |
| `declineColor`             | The color of the Ying lines                                               | string   | `'red'`                       |
| `declineThickness`         | The thickness of the Ying lines                                           | number   | `2`                           |
| `declineThicknessOnHover`  | The thickness of the Ying lines when hovered upon                         | number   | `4`                           |
| `showBreakPoints`          | Whether to show the points where trend reversal happens                   | bool     | `true`                        |
| `breakPointColor`          | The color of the break points                                             | string   | `'blue'`                      |
| `breakPointRadius`         | The radius of the break points                                            | number   | `3`                           |    
| `breakPointRadiusOnHover`  | The radius of the break points when hovered upon                          | number   | `5`                           |    
| `showBreakPointTooltips`   | Whether to show the tooltips when breakpoints are hovered upon            | bool     | `true`                        |
| `showBreakPointText`       | Whether to show the dates on x axis when trend reversal happens           | bool     | `true`                        |
| `showRangeTooltips`        | Whether to show the tooltips showing info for a particular trend          | bool     | `true`                        |    
| `unit`                     | Unit of the stock price \(eg. $ \)                                        | string   | `'$'`                         |
| `isPrecedingUnit`          | Is the unit preceding like $ or succeeding like rupee                     | bool     | `true`                        | 
| `animationEase`            | The common animation easing functions                                            | string   | `'linear'` (default)          | 
| `animationDurationPerTrend`| The duration in which a trend must be animated                            | number   | `500`                         | 
| `showAnimation`            | Whether to show animation or not.                                         | bool     | `true`                        |

# Author

Arpit Narechania
arpitnarechania@gmail.com

# License

MIT license.