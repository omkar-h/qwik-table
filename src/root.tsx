import { component$ } from "@builder.io/qwik";
import { TableSandbox } from "./sandbox/TableSandbox";
import "./sandbox/sandbox.css";

export default component$(() => {
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <title>qwik-table-core Sandbox</title>
      </head>
      <body>
        <TableSandbox />
      </body>
    </>
  );
});
