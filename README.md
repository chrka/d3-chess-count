# d3-chessboard-count

Plot per-square frequencies on a chessboard.  The frequencies are represented by circles —
the higher the frequency, the larger the circle, scaled such that the circle representing
the highest overall frequency takes up the full space of its square minus padding.

<img src="https://github.com/chrka/d3-chessboard-count/raw/master/img/board.png" alt="example board image" width="296px" height="296px"></img>

For an example of the plug-in in action, see this [notebook](https://observablehq.com/@chrka/2016-crazyhouse-championship-drop-and-capture-statistics).

Changes to the data are animated, and the board can be customized, including:

* the size of the squares,
* the number of files and ranks, as well as their names and styles,
* the colors of the squares and circles,
* the orientation of the board (including mirroring across one or both axes).

[TypeScript](http://typescriptlang.org) types are included.


## Installation

If you use NPM, `npm install d3-chessboard-count`. Otherwise, download the 
[latest release](https://github.com/chrka/d3-chessboard-count/releases/latest). 

You can also load directly from directly [unpkg.com](https://unpkg.com) as a 
[standalone library](https://unpkg.com/d3-chessboard-count/dist/d3-chessboard-count.min.js), or
from [jsdelivr.com](https://www.jsdelivr.com) 
[here](https://cdn.jsdelivr.net/npm/d3-chessboard-count/dist/d3-chessboard-count.min.js).

AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3` global is exported:

```html
<script src="https://unpkg.com/d3-chessboard-count/dist/d3-chessboard-count.min.js"></script>
<script>
    const plot = d3.chessboardSquarePlot();
</script>
```


## Basic Usage

First you need to have your data as a list of elements, each describing the count for some square
(described by its file and its rank, both ranging from 0 to the number of files/ranks minus one).
By default, it is assumed that each element is an object with properties `file`, `rank`, and `count`,
but custom accessors can be specified. 

Then, create a `div` to contain the plot and a new `chessboardSquarePlot` object.  
After configuring the plot object, select the `div`, set your data, and apply the plot object to it:

```html
<div id="plot"></div>
<script>
    const plot = d3.chessboardSquarePlot()
                   .margin({top: 16, right: 16, bottom: 16, left: 16})
                   .lightSquareFill('red')
                   .darkSquareFill('black');
    
    d3.select('#plot')
      .datum(data)
      .call(plot);
</script>
```


## API Reference

* [Creating Plots](#creating-plots)
* [Accessors](#accessors)
* [Geometry](#geometry)
* [Files and Ranks](#files-and-ranks)
* [Fill Colors](#fill-colors)


### Creating Plots
<a name="chessboardSquarePlot" href="#chessboardSquarePlot">#</a> d3.<b>chessboardSquarePlot</b>() [<>](https://github.com/chrka/d3-chessboard-count/blob/master/src/index.ts#L107 "Source")

Constructs a new plot with top/right/bottom/left margins of 24, square size of 32,
padding of 4, no mirroring, 8 files and ranks ('a'–'h', '1'–'8'), `white` light squares,
`gainsboro` dark squares, `nero` fill for the circles, which takes files, ranks, and counts from
`file`, `rank`, `count` properties of the data, respectively.


### Accessors

<a name="plot_file" href="#plot_file">#</a> <i>plot</i>.<b>file</b>([<i>file</i>])

If _file_ is specified, sets the file accessor to the specified function and returns this plot generator.
If _file_ is not specified, returns the current file accessor which defaults to a function returning 
the `file` property if available, or 0 otherwise. 

<a name="plot_rank" href="#plot_rank">#</a> <i>plot</i>.<b>rank</b>([<i>rank</i>])

If _rank_ is specified, sets the file accessor to the specified function and returns this plot generator.
If _rank_ is not specified, returns the current rank accessor which defaults to a function returning 
the `file` property if available, or 0 otherwise. 

<a name="plot_rank" href="#plot_rank">#</a> <i>plot</i>.<b>count</b>([<i>count</i>])

If _count_ is specified, sets the count accessor to the specified function and returns this plot generator.
If _count_ is not specified, returns the current count accessor which defaults to a function returning 
the `count` property if available, or 0 otherwise. 


### Geometry

<a name="plot_margins" href="#plot_margins">#</a> <i>plot</i>.<b>margins</b>([<i>margins</i>])

If _margins_ is specified, sets the margins to the specified object.
If _margins_ is not specified, returns the current margins which defaults to `{top: 24, left: 24, bottom: 24, right: 24}`.

The margins define the empty space around the chessboard.

<a name="plot_squareSize" href="#plot_squareSize">#</a> <i>plot</i>.<b>squareSize</b>([<i>squareSize</i>])

If _squareSize_ is specified, sets the square size to the specified number.
If _squareSize_ is not specified, returns the current square size which defaults to 32.

<a name="plot_padding" href="#plot_padding">#</a> <i>plot</i>.<b>padding</b>([<i>padding</i>])

If _padding_ is specified, sets the padding to the specified number.
If _padding_ is not specified, returns the current padding which defaults to 4.

The padding defines the smallest amount of empty space between the edges of a square and the
circle with the maximum radius in the plot.


### Files and Ranks

<a name="plot_files" href="#plot_files">#</a> <i>plot</i>.<b>files</b>([<i>files</i>])

If _files_ is specified, sets the files to the specified list of strings.
If _files_ is not specified, returns the current files which defaults to `['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']`.

<a name="plot_ranks" href="#plot_ranks">#</a> <i>plot</i>.<b>ranks</b>([<i>ranks</i>])

If _ranks_ is specified, sets the ranks to the specified list of strings.
If _ranks_ is not specified, returns the current ranks which defaults to `['1', '2', '3', '4', '5', '6', '7', '8']`.

<a name="plot_fileStyle" href="#plot_fileStyle">#</a> <i>plot</i>.<b>fileStyle</b>([<i>fileStyle</i>])

If _fileStyle_ is specified, sets the file label style to the specified CSS style.
If _fileStyle_ is not specified, returns the current file label style which is empty by default.

<a name="plot_rankStyle" href="#plot_rankStyle">#</a> <i>plot</i>.<b>rankStyle</b>([<i>rankStyle</i>])

If _rankStyle_ is specified, sets the rank label style to the specified CSS style.
If _rankStyle_ is not specified, returns the current rank label style which is empty by default.

<a name="plot_mirrorFiles" href="#plot_mirrorFiles">#</a> <i>plot</i>.<b>mirrorFiles()</b>([<i>mirrorFiles</i>])

If _mirrorFiles_ is specified, mirror the board along the files if true.
If _mirrorFiles_ is not specified, returns the current state of the mirroring.

<a name="plot_mirrorRanks" href="#plot_mirrorRanks">#</a> <i>plot</i>.<b>mirrorRanks()</b>([<i>mirrorRanks</i>])

If _mirrorRanks_ is specified, mirror the board along the ranks if true.
If _mirrorRanks_ is not specified, returns the current state of the mirroring.
To rotate the board, mirror along both files and ranks.


### Fill Colors

<a name="plot_lightSquareFill" href="#plot_lightSquareFill">#</a> <i>plot</i>.<b>lightSquareFill</b>([<i>lightSquareFill</i>])

If _lightSquareFill_ is specified, sets the light square fill color to the specified CSS color string.
If _lightSquareFill_ is not specified, returns the current light square fill color which defaults to `white`.

<a name="plot_darkSquareFill" href="#plot_darkSquareFill">#</a> <i>plot</i>.<b>darkSquareFill</b>([<i>darkSquareFill</i>])

If _darkSquareFill_ is specified, sets the dark square fill color to the specified CSS color string.
If _darkSquareFill_ is not specified, returns the current dark square fill color which defaults to `gainsboro`.


<a name="plot_circleFill" href="#plot_circleFill">#</a> <i>plot</i>.<b>circleFill</b>([<i>circleFill</i>])

If _circleFill_ is specified, sets the circle fill color to the specified CSS color string.
If _circleFill_ is not specified, returns the current circle fill color which defaults to `nero`.


## Contributing

Comments, suggestions, and pull requests are welcome.
 

## Acknowledgments

The structure of the plugin is based on [Mike Bostock](https://bost.ocks.org/mike/)'s 
article _[Towards Reusable Charts](https://bost.ocks.org/mike/chart/)_, and the packaging
on _[Let's Make a (D3) Plugin](https://bost.ocks.org/mike/d3-plugin/)_ with some
updates taken from other D3 plugins, and additional support for TypeScript.


## License (MIT)

Copyright (c) 2020 Christoffer Karlsson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
