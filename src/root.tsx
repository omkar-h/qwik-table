import { QwikTable } from "./components/qwikTable/qwikTable";

const mockUsers = [
  { firstName: "Aarav", lastName: "Joshi", age: 28 },
  { firstName: "Ananya", lastName: "Sharma", age: 24 },
  { firstName: "Rohan", lastName: "Deshmukh", age: 31 },
  { firstName: "Priya", lastName: "Patil", age: 27 },
  { firstName: "Kabir", lastName: "Mehta", age: 35 },
  { firstName: "Sanya", lastName: "Verma", age: 22 },
  { firstName: "Aditya", lastName: "Kulkarni", age: 29 },
  { firstName: "Diya", lastName: "Nair", age: 26 },
  { firstName: "Rahul", lastName: "Singh", age: 33 },
  { firstName: "Isha", lastName: "Gupta", age: 30 },
  { firstName: "Vikram", lastName: "Shinde", age: 42 },
  { firstName: "Meera", lastName: "Rao", age: 25 },
  { firstName: "Arjun", lastName: "Chavan", age: 28 },
  { firstName: "Neha", lastName: "Mishra", age: 31 },
  { firstName: "Yash", lastName: "Gawde", age: 23 },
];

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
            { id: "firstName", label: "First Name", sortable: true },
            { id: "lastName", label: "Last Name", sortable: true },
            { id: "age", label: "age", sortable: true },
          ]}
          rowData={mockUsers}
        />
      </body>
    </>
  );
};
