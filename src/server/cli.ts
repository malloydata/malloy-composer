import { Command } from "commander";
import { initServer } from "./server";

const program = new Command();

program
  .name("malloy-composer-cli")
  .description("CLI tool for Malloy Composer server")
  .version("0.0.1")
  .argument(
    "[path]",
    "The 'root' for this Malloy instance (a datasets JSON file, a models JSON file, a model Malloy file, or a directory)",
    "."
  )
  .option("-p, --port <integer>", "Port for server to listen on", "4000")
  .option("-h, --host <string>", "Hostname for server to bind to", "localhost");

program.parse();

const { host, port } = program.opts();

const devMode = process.env.DEV === "1";

process.env.ROOT = program.args[0];
initServer({ devMode, port, host });
