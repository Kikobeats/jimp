import { mulTable, shgTable } from "./blur-tables.js";
import { JimpClass } from "@jimp/types";

/*
    Superfast Blur (0.5)
    http://www.quasimondo.com/BoxBlurForCanvas/FastBlur.js

    Copyright (c) 2011 Mario Klingemann

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
*/

export function blur<I extends JimpClass>(image: I, r: number) {
  if (typeof r !== "number") {
    throw new Error("r must be a number");
  }

  if (r < 1) {
    throw new Error("r must be greater than 0");
  }

  let rsum: number;
  let gsum: number;
  let bsum: number;
  let asum: number;
  let x: number;
  let y: number;
  let i: number;
  let p: number;
  let p1: number;
  let p2: number;
  let yp: number;
  let yi: number;
  let yw: number;
  let pa: number;

  const wm = image.bitmap.width - 1;
  const hm = image.bitmap.height - 1;
  // const wh = image.bitmap.width * image.bitmap.height;
  const rad1 = r + 1;

  const mulSum = mulTable[r]!;
  const shgSum = shgTable[r]!;

  const red = [];
  const green = [];
  const blue = [];
  const alpha = [];

  const vmin = [];
  const vmax = [];

  let iterations = 2;

  while (iterations-- > 0) {
    yi = 0;
    yw = 0;

    for (y = 0; y < image.bitmap.height; y++) {
      rsum = image.bitmap.data[yw]! * rad1;
      gsum = image.bitmap.data[yw + 1]! * rad1;
      bsum = image.bitmap.data[yw + 2]! * rad1;
      asum = image.bitmap.data[yw + 3]! * rad1;

      for (i = 1; i <= r; i++) {
        p = yw + ((i > wm ? wm : i) << 2);
        rsum += image.bitmap.data[p++]!;
        gsum += image.bitmap.data[p++]!;
        bsum += image.bitmap.data[p++]!;
        asum += image.bitmap.data[p]!;
      }

      for (x = 0; x < image.bitmap.width; x++) {
        red[yi] = rsum;
        green[yi] = gsum;
        blue[yi] = bsum;
        alpha[yi] = asum;

        if (y === 0) {
          vmin[x] = ((p = x + rad1) < wm ? p : wm) << 2;
          vmax[x] = (p = x - r) > 0 ? p << 2 : 0;
        }

        p1 = yw + vmin[x]!;
        p2 = yw + vmax[x]!;

        rsum += image.bitmap.data[p1++]! - image.bitmap.data[p2++]!;
        gsum += image.bitmap.data[p1++]! - image.bitmap.data[p2++]!;
        bsum += image.bitmap.data[p1++]! - image.bitmap.data[p2++]!;
        asum += image.bitmap.data[p1]! - image.bitmap.data[p2++]!;

        yi++;
      }

      yw += image.bitmap.width << 2;
    }

    for (x = 0; x < image.bitmap.width; x++) {
      yp = x;
      rsum = red[yp]! * rad1;
      gsum = green[yp]! * rad1;
      bsum = blue[yp]! * rad1;
      asum = alpha[yp]! * rad1;

      for (i = 1; i <= r; i++) {
        yp += i > hm ? 0 : image.bitmap.width;
        rsum += red[yp]!;
        gsum += green[yp]!;
        bsum += blue[yp]!;
        asum += alpha[yp]!;
      }

      yi = x << 2;

      for (y = 0; y < image.bitmap.height; y++) {
        pa = (asum * mulSum) >>> shgSum;
        image.bitmap.data[yi + 3] = pa;

        // normalize alpha
        if (pa > 255) {
          image.bitmap.data[yi + 3] = 255;
        }

        if (pa > 0) {
          pa = 255 / pa;
          image.bitmap.data[yi] = ((rsum * mulSum) >>> shgSum) * pa;
          image.bitmap.data[yi + 1] = ((gsum * mulSum) >>> shgSum) * pa;
          image.bitmap.data[yi + 2] = ((bsum * mulSum) >>> shgSum) * pa;
        } else {
          image.bitmap.data[yi + 2] = 0;
          image.bitmap.data[yi + 1] = 0;
          image.bitmap.data[yi] = 0;
        }

        if (x === 0) {
          vmin[y] = ((p = y + rad1) < hm ? p : hm) * image.bitmap.width;
          vmax[y] = (p = y - r) > 0 ? p * image.bitmap.width : 0;
        }

        p1 = x + vmin[y]!;
        p2 = x + vmax[y]!;

        rsum += red[p1]! - red[p2]!;
        gsum += green[p1]! - green[p2]!;
        bsum += blue[p1]! - blue[p2]!;
        asum += alpha[p1]! - alpha[p2]!;

        yi += image.bitmap.width << 2;
      }
    }
  }

  return image;
}

export default function blurPlugin() {
  return {
    /**
     * A fast blur algorithm that produces similar effect to a Gaussian blur - but MUCH quicker
     * @param r the pixel radius of the blur
     */
    blur,
  };
}
