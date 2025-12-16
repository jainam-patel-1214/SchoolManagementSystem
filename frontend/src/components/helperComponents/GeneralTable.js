import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { FaArrowUpZA, FaArrowUpAZ } from "react-icons/fa6";
import styled from "styled-components";
const TableComp = styled.table`
  width: 45%;
  height: fit-content;
  border: none;
`;
const TableTrEntry = styled.tr`
  background-color: ${(props) =>
    props.isEven === 0 ? "#d7d8fe9c" : "#f7e7fc81"};
  text-align: center;
`;
const TableThEntry = styled.th`
  background-color: #6366f1;
  color: white;
  font-weight: normal;
`;
const TableTdEntry = styled.td`
  text-align: center;
`;
export const GeneralTableComponent = ({ data, columnDefinition }) => {
  const finalData = useMemo(() => data, [data]);
  const finalColumnDef = useMemo(() => columnDefinition, [columnDefinition]);
  const [sorting, setSorting] = useState([]);

  const tableInstance = useReactTable({
    columns: finalColumnDef,
    data: finalData,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  return (
    <TableComp style={{ width: "100%" }}>
      <thead style={{ backgroundColor: "pink" }}>
        {tableInstance.getHeaderGroups().map((headElem, i) => {
          return (
            <tr key={i}>
              {headElem.headers.map((colElem, i) => {
                return (
                  <TableThEntry
                    key={i}
                    colSpan={colElem.colSpan}
                    onClick={colElem.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      colElem.column.columnDef.header,
                      colElem.getContext()
                    )}
                    {colElem?.column.getIsSorted() === "asc" ? (
                      <FaArrowUpAZ />
                    ) : (
                      ""
                    )}
                    {colElem?.column.getIsSorted() === "desc" ? (
                      <FaArrowUpZA />
                    ) : (
                      ""
                    )}
                  </TableThEntry>
                );
              })}
            </tr>
          );
        })}
      </thead>
      <tbody>
        {tableInstance.getRowModel().rows.map((rowElem, i) => {
          return (
            <TableTrEntry isEven={i % 2} id={i} key={i}>
              {rowElem.getVisibleCells().map((cellElem, i) => {
                return (
                  <TableTdEntry key={i}>
                    {flexRender(
                      cellElem.column.columnDef.cell,
                      cellElem.getContext()
                    )}
                  </TableTdEntry>
                );
              })}
            </TableTrEntry>
          );
        })}
      </tbody>
    </TableComp>
  );
};
