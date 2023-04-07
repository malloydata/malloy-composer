/*
 * Copyright 2023 Google LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files
 * (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge,
 * publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import express from 'express';
import {routes} from './routes';
import cors from 'cors';
import * as path from 'path';
import logging from './logging';

const app = express();

const DEV = process.env['DEV'] === '1';
const PORT = (process.env['PORT'] || 4000) as number;
const HOST = process.env['HOST'] || 'localhost';

const allowedOrigins = [];

if (DEV) {
  // eslint-disable-next-line no-console
  console.log('DEV Enabled');
  allowedOrigins.push(`http://${HOST}:${PORT}`);
}

app.use(logging.basicLogging);
app.use(cors({origin: allowedOrigins}));
app.use(express.json());

const router = express.Router();

routes(router);

app.use('/api', router);

const BUILD_ROOT = path.join(__dirname, '../build');

app.use('/static', express.static(path.join(BUILD_ROOT, '/app')));

app.use('/fonts', express.static(path.join(BUILD_ROOT, '/app/fonts')));

app.use('/', express.static(path.join(BUILD_ROOT, '/app')));

if (DEV) {
  app.use(
    '/packages',
    express.static(path.join(BUILD_ROOT, '../../../packages'))
  );
}

app.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running at http://${HOST}:${PORT}`);
});
