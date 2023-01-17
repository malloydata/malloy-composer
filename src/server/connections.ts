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

import {
  Connection,
  FixedConnectionMap,
  LookupConnection,
} from "@malloydata/malloy";
import { BigQueryConnection } from "@malloydata/db-bigquery";
import { DuckDBConnection } from "@malloydata/db-duckdb";
import { PostgresConnection } from "@malloydata/db-postgres";
import * as path from "path";
import { fileURLToPath } from "url";

class ConnectionManager {
  private connectionLookups: Map<string, LookupConnection<Connection>> =
    new Map();
  private readonly bigqueryConnection = new BigQueryConnection("bigquery");
  private readonly postgresConnection = new PostgresConnection("postgres");

  public getConnectionLookup(url: URL): LookupConnection<Connection> {
    const workingDirectory = path.dirname(fileURLToPath(url));
    let connectionLookup = this.connectionLookups.get(workingDirectory);
    if (connectionLookup === undefined) {
      connectionLookup = new FixedConnectionMap(
        new Map<string, Connection>([
          ["bigquery", this.bigqueryConnection],
          ["postgres", this.postgresConnection],
          [
            "duckdb",
            new DuckDBConnection("duckdb", ":memory:", workingDirectory),
          ],
        ]),
        "bigquery"
      );
      this.connectionLookups.set(workingDirectory, connectionLookup);
    }
    return connectionLookup;
  }
}

export const CONNECTION_MANAGER = new ConnectionManager();
