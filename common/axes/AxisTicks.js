'use strict';

var React = require('react');
var d3 = require('d3');

module.exports = React.createClass({

  displayName: 'AxisTick',

  propTypes: {
    scale: React.PropTypes.func.isRequired,
    orient: React.PropTypes.oneOf(['top','bottom','left','right']).isRequired,
    orient2nd: React.PropTypes.oneOf(['top','bottom','left','right']),
    height: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    horizontal: React.PropTypes.bool,
    tickArguments : React.PropTypes.array,
    tickValues: React.PropTypes.array,
    innerTickSize: React.PropTypes.number,
    outerTickSize: React.PropTypes.number,
    tickPadding: React.PropTypes.number,
    tickFormat: React.PropTypes.func,
    tickStroke: React.PropTypes.string,
    gridHorizontal: React.PropTypes.bool,
    gridVertical: React.PropTypes.bool,
    gridHorizontalStroke: React.PropTypes.string,
    gridVerticalStroke: React.PropTypes.string,
    gridHorizontalStrokeWidth: React.PropTypes.number,
    gridVerticalStrokeWidth: React.PropTypes.number,
    gridHorizontalStrokeDash: React.PropTypes.string,
    gridVerticalStrokeDash: React.PropTypes.string
  },
  getDefaultProps:function() {
    return {
      innerTickSize: 6,
      outerTickSize: 6,
      tickStroke: '#000',
      tickPadding: 3,
      tickArguments: [10],
      tickValues: null,
      gridHorizontal: false,
      gridVertical: false,
      gridHorizontalStroke: '#D8D7D7',
      gridVerticalStroke: '#D8D7D7',
      gridHorizontalStrokeWidth: 1,
      gridVerticalStrokeWidth: 1,
      gridHorizontalStrokeDash: '5, 5',
      gridVerticalStrokeDash: '5, 5'
    };
  },

  render:function() {
    var props = this.props;

    var tr,
        ticks,
        scale,
        adjustedScale,
        orient,
        textAnchor,
        textTransform,
        tickFormat,
        y0, y1, y2, dy, x0, x1, x2, dx;

    var gridStrokeWidth,
        gridStroke,
        gridStrokeDashArray,
        x2grid,
        y2grid;
    var gridOn = false;

    var sign = props.orient === 'top' || props.orient === 'right' ? -1 : 1;
    var tickSpacing = Math.max(props.innerTickSize, 0) + props.tickPadding;

    scale = props.scale;

    if (props.tickValues) {
      ticks = props.tickValues;
    } else if (scale.ticks) {
      ticks = scale.ticks.apply(scale, props.tickArguments);
    } else {
      ticks = scale.domain();
    }

    if (props.tickFormatting) {
        tickFormat = props.tickFormatting;
    } else if (scale.tickFormat) {
        tickFormat = scale.tickFormat.apply(scale, props.tickArguments);
    } else {
        tickFormat = function(d) {return d;};
    }

    adjustedScale = scale.rangeBand ? function(d)  { return scale(d) + scale.rangeBand() / 2; } : scale;


    // Still working on this
    // Ticks and lines are not fully aligned
    // in some orientations
    switch (props.orient) {
      case 'top':
        tr = function(tick)  {return ("translate(" + adjustedScale(tick) + ",0)");};
        textAnchor = "middle";
        y2 = props.innerTickSize * sign;
        y1 = tickSpacing * sign;
        dy =  sign < 0 ? "0em" : ".71em";
        x2grid = 0;
        y2grid = -props.height;
        break;
      case 'bottom':
        tr = function(tick)  {return ("translate(" + adjustedScale(tick) + ",0)");};
        textAnchor = "middle";
        y2 = props.innerTickSize * sign;
        y1 = tickSpacing * sign;
        dy =  sign < 0 ? "0em" : ".71em";
        x2grid = 0;
        y2grid = -props.height;
        break;
      case 'left':
        tr = function(tick)  {return ("translate(0," + adjustedScale(tick) + ")");};
        textAnchor = "end";
        x2 = props.innerTickSize * -sign;
        x1 = tickSpacing * -sign;
        dy = ".32em";
        x2grid = props.width;
        y2grid = 0;
        break;
      case 'right':
        tr = function(tick)  {return ("translate(0," + adjustedScale(tick) + ")");};
        textAnchor = "start";
        x2 = props.innerTickSize * -sign;
        x1 = tickSpacing * -sign;
        dy = ".32em";
        x2grid = -props.width;
        y2grid = 0;
        break;
    }

    if (props.horizontalChart) {
      textTransform = "rotate(-90)";
      var $__0=   [x1, -y1 || 0];y1=$__0[0],x1=$__0[1];

      switch (props.orient) {
        case 'top':
          textAnchor = "start";
          dy = ".32em";
          break;
        case 'bottom':
          textAnchor = "end";
          dy = ".32em";
          break;
        case 'left':
          textAnchor = 'middle';
          dy = sign < 0 ? ".71em" : "0em";
          break;
        case 'right':
          textAnchor = 'middle';
          dy = sign < 0 ? ".71em" : "0em";
          break;
      }
    }

    if (props.gridHorizontal) {
      gridOn = true;
      gridStrokeWidth = props.gridHorizontalStrokeWidth;
      gridStroke = props.gridHorizontalStroke;
      gridStrokeDashArray = props.gridHorizontalStrokeDash;
    }
    else if (props.gridVertical) {
      gridOn = true;
      gridStrokeWidth = props.gridVerticalStrokeWidth;
      gridStroke = props.gridVerticalStroke;
      gridStrokeDashArray = props.gridVerticalStrokeDash;
    }

    // return grid line if grid is enabled and grid line is not on at same position as other axis.
    var gridLine = function(pos) {
      if (gridOn
        && !(props.orient2nd == 'left' && pos == 0)
        && !(props.orient2nd == 'right' && pos == props.width)
        && !((props.orient == 'left' || props.orient == 'right') && pos == props.height)
      ) {
        return (
          React.createElement("line", {style: {
            strokeWidth: gridStrokeWidth,
            shapeRendering: 'crispEdges',
            stroke: gridStroke,
            strokeDasharray: gridStrokeDashArray
            }, x2: x2grid, y2: y2grid})
        )
      }
    }

    var optionalTextProps = textTransform ? {
      transform: textTransform
    } : {};

    return (
    React.createElement("g", null, 
      ticks.map( function(tick, idx)  {
        return (
          React.createElement("g", {key: idx, className: "tick", transform: tr(tick)}, 
            gridLine(adjustedScale(tick)), 
            React.createElement("line", {style: {shapeRendering:'crispEdges',opacity:'1',stroke:props.tickStroke}, x2: x2, y2: y2}
            ), 
            React.createElement("text", React.__spread({
              strokeWidth: "0.01", 
              dy: dy, x: x1, y: y1, 
              style: {stroke:props.tickTextStroke, fill:props.tickTextStroke}, 
              textAnchor: textAnchor}, 
              optionalTextProps
            ), 
              tickFormat(tick)
            )
          )
        );
        })
      
    )
    );
  }

});
