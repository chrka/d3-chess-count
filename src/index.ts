import {Selection, select} from 'd3-selection';
import {scaleSqrt, scaleLinear, scalePoint} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";
import {max, range, merge, sum} from 'd3-array';

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Might consider adding ability to set constants for file/rank/count
// for consistency with other d3 modules.  Apart from (maybe) count
// it's never really useful though.

export interface ChessboardSquarePlot<Datum> {
  /** Renders the plot in the selection.
   *
   * @param selection
   */
  (selection: Selection<HTMLElement, Datum[], HTMLElement, unknown>): this;

  margins(): Margins;
  margins(newMargins: Margins): this;

  squareSize(): number;
  squareSize(newSquareSize: number): this;

  padding(): number;
  padding(newPadding: number): this;

  notationPadding(): number;
  notationPadding(newPadding: number): this;

  mirrorFiles(): boolean;
  mirrorFiles(newMirrorFiles: boolean): this;

  mirrorRanks(): boolean;
  mirrorRanks(newMirrorRanks: boolean): this;

  file(): (d: Datum) => number;
  file(newFile: (d: Datum) => number): this;

  rank(): (d: Datum) => number;
  rank(newRank: (d: Datum) => number): this;

  count(): (d: Datum) => number;
  count(newCount: (d: Datum) => number): this;

  files(): string[];
  files(newFiles: string[]): this;

  ranks(): string[];
  ranks(newRanks: string[]): this;

  fileStyle(): string;
  fileStyle(newFileStyle: string): this;

  rankStyle(): string;
  rankStyle(newRankStyle: string): this;

  lightSquareFill(): string;
  lightSquareFill(newLightSquareFill: string): this;

  darkSquareFill(): string;
  darkSquareFill(newDarkSquareFill: string): this;

  circleFill(): string;
  circleFill(newCircleFill: string): this;
}

enum Color {
  Dark,
  Light
}

interface Cell {
  row: number;
  col: number;
  count: number;
  color: Color;
}

/**
 * Creates a function that extracts a numeric property if possible, or returns 0 otherwise.
 * @param field
 * @returns {(d: any) => number}
 */
function maybeExtractField(field: string): (d: any) => number {
  return (d: any) => {
    if (typeof d === 'object') {
      let v = d[field];
      return typeof v === 'number' ? v : 0
    } else {
      return 0
    }
  }
}


// noinspection JSUnusedGlobalSymbols
/**
 * Constructs a new plot with top/right/bottom/left margins of 24, square size of 32,
 * padding of 4, no mirroring, 8 files and ranks ('a'–'h', '1'–'8'), `white` light squares,
 * `gainsboro` dark squares, `nero` fill for the circles, which takes files, ranks, and counts from
 * `file`, `rank`, `count` properties of the data, respectively.
 * @returns {ChessboardSquarePlot<Datum>}
 */
export function chessboardSquarePlot<Datum>(): ChessboardSquarePlot<Datum> {
  let margins: Margins = {top: 24, left: 24, bottom: 24, right: 24};
  let squareSize = 32;
  let padding = 4;
  let notationPadding = 6;

  let mirrorFiles = false;
  let mirrorRanks = false;

  let rScale = scaleSqrt();

  let file = maybeExtractField('file');
  let rank = maybeExtractField('rank');
  let count = maybeExtractField('count');

  let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  let ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];

  let fileStyle = "";
  let rankStyle = "";

  let lightSquareFill = "white";
  let darkSquareFill = "gainsboro";
  // Previously had separate circle fills for light and dark squares.
  // Might bring back if useful.
  let circleFill = "nero";

  let oldSquareSize = squareSize;
  let oldNumFiles = files.length;
  let oldNumRanks = ranks.length;

  // Scales for positioning
  let rowScale = scaleLinear();
  let colScale = scaleLinear();

  // Scales for axis
  let fileScale = scalePoint();
  let rankScale = scalePoint();

  let fileAxis = axisBottom(fileScale);
  let rankAxis = axisLeft(rankScale);

  function key(d: Cell): string {
    return `${d.col},${d.row}`;
  }

  function color(d: Cell): string {
    return d.color == Color.Light ? lightSquareFill : darkSquareFill;
  }

  let squarePlot = ((selection: Selection<HTMLElement, Datum[], HTMLElement, unknown>): ChessboardSquarePlot<Datum> => {
    selection.each(function (data: Datum[]): void {
      const numFiles = files.length;
      const numRanks = ranks.length;

      // See if we should use transitions
      const suppressTransition = oldSquareSize != squareSize || oldNumFiles != numFiles || oldNumRanks != numRanks;
      oldSquareSize = squareSize;
      oldNumFiles = numFiles;
      oldNumRanks = numRanks;

      function cellColor(row: number, col: number): Color {
        return (row + col + Number(mirrorRanks) + Number(mirrorFiles)) % 2 ? Color.Light : Color.Dark;
      }

      function fillData(data: Datum[]): Cell[] {
        let filled = range(numRanks).map(row => range(numFiles).map(col => ({
          row, col, count: 0,
          color: cellColor(row, col)
        })));
        data.forEach(d => {
          const dFile = file(d);
          const dRank = rank(d);
          if (dFile >= 0 && dFile < numFiles && dRank >= 0 && dRank < numRanks) {
            const row = mirrorRanks ? numRanks - dRank - 1 : dRank;
            const col = mirrorFiles ? numFiles - dFile - 1 : dFile;
            filled[row][col].count = count(d);
          }
        });

        return merge(filled);
      }

      let cells = fillData(data);

      const width = margins.left + numFiles * squareSize + margins.right;
      const height = margins.top + numRanks * squareSize + margins.bottom;

      // Set up scales and axis
      rowScale
        .domain([0, numRanks])
        .range([numRanks * squareSize - 0.5 * squareSize, -0.5 * squareSize]);

      colScale
        .domain([0, numFiles])
        .range([0.5 * squareSize, numFiles * squareSize + 0.5 * squareSize]);

      fileScale
        .domain(mirrorFiles ? [...files].reverse() : files)
        .range([0, numFiles * squareSize])
        .padding(0.5);

      rankScale
        .domain(mirrorRanks ? [...ranks].reverse() : ranks)
        .range([numRanks * squareSize, 0])
        .padding(0.5);

      fileAxis
        .tickSize(notationPadding);

      rankAxis
        .tickSize(notationPadding);

      // Statistics for scaling and tooltips
      const maxCount = max(data.map(count));
      const totalCount = sum(data.map(count));

      // Set up circle scale
      rScale
        .domain([0, maxCount !== undefined ? maxCount : 0])
        .range([0, squareSize / 2 - padding]);

      // Select SVG element, if it exists
      let svg = select(this)
        .selectAll<SVGSVGElement, Cell[]>('svg')
        .data([cells]);

      // Create SVG
      let svgEnter = svg
        .enter()
        .append('svg');
      svgEnter
        .merge(svg)
        .attr('width', width)
        .attr('height', height);

      // Set up board
      svgEnter
        .append('g')
        .attr('class', "board");
      svgEnter
        .merge(svg)
        .select('g.board')
        .attr('transform', `translate(${margins.left},${margins.top})`);

      // Render file axis
      svgEnter
        .select('g.board')
        .append('g')
        .attr('class', 'x axis');
      svgEnter
        .merge(svg)
        .select<SVGSVGElement>('g.x.axis')
        .attr('transform', `translate(0,${numRanks * squareSize})`)
        .call(fileAxis);

      let fileAxisElement = svgEnter
        .select('g.x.axis')
        .merge(svg.select('g.x.axis'));
      fileAxisElement
        .selectAll('line')
        .remove();
      fileAxisElement
        .selectAll('path')
        .remove();
      fileAxisElement
        .selectAll('text')
        .attr('style', fileStyle);

      // Render rank axis
      svgEnter
        .select('g.board')
        .append('g')
        .attr('class', 'y axis');
      svgEnter
        .merge(svg)
        .select<SVGSVGElement>('g.y.axis')
        .attr('class', 'y axis')
        .call(rankAxis);

      let rankAxisElement =
        svgEnter
          .select('g.y.axis')
          .merge(svg.select('g.y.axis'));
      rankAxisElement
        .selectAll('line')
        .remove();
      rankAxisElement
        .selectAll('path')
        .remove();
      rankAxisElement
        .selectAll('text')
        .attr('style', rankStyle);

      // Add square containers
      let squares = svgEnter
        .merge(svg)
        .select<SVGSVGElement>('g.board')
        .selectAll<SVGSVGElement, Cell>('g.square')
        .data(d => d, key);

      let squaresEnter = squares
        .enter()
        .append<SVGSVGElement>('g')
        .attr('class', "square");

      // Tooltips (add customization in the future)
      squaresEnter
        .append('title');
      squaresEnter
        .merge(squares)
        .select('title')
        .text(d => `${d.count} / ${totalCount}`);

      // Square rectangles
      squaresEnter
        .append('rect')
        .style('fill', color);
      squaresEnter
        .merge(squares)
        .select('rect')
        .attr('x', d => colScale(d.col) - squareSize / 2)
        .attr('y', d => rowScale(d.row) - squareSize / 2)
        .attr('width', squareSize)
        .attr('height', squareSize);

      if (suppressTransition) {
        squares
          .select('rect')
          .style('fill', color);
      } else {
        squares
          .select('rect')
          .transition()
          .style('fill', color);
      }

      // Square circles
      squaresEnter
        .append('circle')
        .attr('r', d => rScale(d.count))
        .attr('fill', circleFill);
      squaresEnter
        .merge(squares)
        .select('circle')
        .attr('cx', d => colScale(d.col))
        .attr('cy', d => rowScale(d.row));

      if (suppressTransition) {
        squares
          .select('circle')
          .attr('r', d => rScale(d.count))
      } else {
        squares
          .select('circle')
          .transition()
          .attr('r', d => rScale(d.count))
      }

      squares
        .exit()
        .remove();
    });

    return squarePlot;
  }) as ChessboardSquarePlot<Datum>;

  squarePlot.margins = (newMargins?: Margins): any => {
    if (newMargins === undefined) {
      return margins;
    } else {
      margins = newMargins;
      return squarePlot;
    }
  };

  squarePlot.squareSize = (newSquareSize?: number): any => {
    if (newSquareSize === undefined) {
      return squareSize;
    } else {
      squareSize = newSquareSize;
      return squarePlot;
    }
  };

  squarePlot.notationPadding = (newPadding?: number): any => {
    if (newPadding === undefined) {
      return notationPadding;
    } else {
      notationPadding = newPadding;
      return squarePlot;
    }
  };

  squarePlot.padding = (newPadding?: number): any => {
    if (newPadding === undefined) {
      return padding;
    } else {
      padding = newPadding;
      return squarePlot;
    }
  };

  squarePlot.mirrorFiles = (newMirrorFiles?: boolean): any => {
    if (newMirrorFiles === undefined) {
      return mirrorFiles;
    } else {
      mirrorFiles = newMirrorFiles;
      return squarePlot;
    }
  };

  squarePlot.mirrorRanks = (newMirrorRanks?: boolean): any => {
    if (newMirrorRanks === undefined) {
      return mirrorRanks;
    } else {
      mirrorRanks = newMirrorRanks;
      return squarePlot;
    }
  };

  squarePlot.file = (newFile?: (d: Datum) => number): any => {
    if (newFile === undefined) {
      return file;
    } else {
      file = newFile;
      return squarePlot;
    }
  };

  squarePlot.rank = (newRank?: (d: Datum) => number): any => {
    if (newRank === undefined) {
      return rank;
    } else {
      rank = newRank;
      return squarePlot;
    }
  };

  squarePlot.count = (newCount?: (d: Datum) => number): any => {
    if (newCount === undefined) {
      return count;
    } else {
      count = newCount;
      return squarePlot;
    }
  };

  squarePlot.files = (newFiles?: string[]): any => {
    if (newFiles === undefined) {
      return files;
    } else {
      files = newFiles;
      return squarePlot;
    }
  };

  squarePlot.ranks = (newRanks?: string[]): any => {
    if (newRanks === undefined) {
      return ranks;
    } else {
      ranks = newRanks;
      return squarePlot;
    }
  };

  squarePlot.fileStyle = (newFileStyle?: string): any => {
    if (newFileStyle === undefined) {
      return fileStyle;
    } else {
      fileStyle = newFileStyle;
      return squarePlot;
    }
  };

  squarePlot.rankStyle = (newRankStyle?: string): any => {
    if (newRankStyle === undefined) {
      return rankStyle;
    } else {
      rankStyle = newRankStyle;
      return squarePlot;
    }
  };

  squarePlot.lightSquareFill = (newLightSquareFill?: string): any => {
    if (newLightSquareFill === undefined) {
      return lightSquareFill;
    } else {
      lightSquareFill = newLightSquareFill;
      return squarePlot;
    }
  };

  squarePlot.darkSquareFill = (newDarkSquareFill?: string): any => {
    if (newDarkSquareFill === undefined) {
      return darkSquareFill;
    } else {
      darkSquareFill = newDarkSquareFill;
      return squarePlot;
    }
  };

  squarePlot.circleFill = (newCircleFill?: string): any => {
    if (newCircleFill === undefined) {
      return circleFill;
    } else {
      circleFill = newCircleFill;
      return squarePlot;
    }
  };

  return squarePlot;
}
