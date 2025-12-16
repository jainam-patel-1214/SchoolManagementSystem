import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
} from "@tanstack/react-table";
import { TableHeader } from "../../styled-components/TableComponents";
import { SubInfo, TableEntry } from "../studentComponents/Home";
import { SearchOutputSection } from "../studentComponents/SchoolResult";
import { useMemo, useState } from "react";
import { FaArrowUpZA, FaArrowUpAZ } from "react-icons/fa6";

export const RequestsTableComponent = ({ data, columnDefinition, heading }) => {
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
    <SearchOutputSection style={{ paddingBottom: "1.5rem" }}>
      <h3 style={{ textAlign: "center" }}>{heading}</h3>
      <SubInfo style={{ width: "100%" }}>
        <thead>
          {tableInstance.getHeaderGroups().map((headElem, i) => {
            return (
              <tr key={i}>
                {headElem.headers.map((colElem, i) => {
                  return (
                    <TableHeader
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
                    </TableHeader>
                  );
                })}
              </tr>
            );
          })}
        </thead>
        <tbody>
          {tableInstance.getRowModel().rows.map((rowElem, i) => {
            return (
              <tr id={i} key={i}>
                {rowElem.getVisibleCells().map((cellElem, i) => {
                  return (
                    <TableEntry key={i}>
                      {flexRender(
                        cellElem.column.columnDef.cell,
                        cellElem.getContext()
                      )}
                    </TableEntry>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </SubInfo>
    </SearchOutputSection>
  );
};
