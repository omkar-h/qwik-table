import { QwikTable } from "./components/qwikTable/qwikTable";

export default () => {
  return (
    <>
      <head>
        <meta charset="utf-8" />
        <title>Qwik Blank App</title>
      </head>
      <body>
        <QwikTable
          columnConfig={[
            { id: "firstName", label: "First Name" },
            { id: "lastName", label: "Last Name" },
            { id: "age", label: "age" },
          ]}
          rowData={[
            {
              firstName: "Omkar",
              lastName: "Hankare",
              age: 27,
            },
          ]}
        />
      </body>
    </>
  );
};
