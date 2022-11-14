import { exec } from "child_process";
import { Command } from "commander";
import * as path from "path";

const program = new Command();

program
  .name("malloy-composer-cli")
  .description("CLI tool for Malloy Composer server")
  .version("0.0.1")
  .option(
    "-m, --datasets <string>",
    "Datasets config file; one dataset config file; or directory containing a config file",
    "."
  )
  .option("-p, --port <integer>", "Port for server to listen on", "4000")
  .option("-h, --host <string>", "Hostname for server to bind to", "localhost");

program.parse();

const composerProcess = exec(`node ${path.join(__dirname, "server.js")}`, {
  env: {
    ...process.env,
    PORT: `${program.opts().port}`,
    HOST: `${program.opts().host}`,
    DATASETS: `${program.opts().datasets}`,
  },
});

composerProcess.stdout?.pipe(process.stdout);
composerProcess.stderr?.pipe(process.stderr);
