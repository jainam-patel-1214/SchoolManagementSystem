import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { TableHeader } from '../../styled-components/TableComponents'
import { SubInfo, TableEntry } from '../studentComponents/Home'
import { SearchOutputSection } from '../studentComponents/SchoolRes'
import { useMemo } from 'react'


export const ReactTableComponent = (props) => {

    const finalData = useMemo(()=>props?.data,[props?.data])
    const finalCOlumnDef = useMemo(()=>props?.columnDefinition,[])

    const tableInstance = useReactTable({
        columns: finalCOlumnDef,
        data: finalData,
        getCoreRowModel: getCoreRowModel()
    })

    return (
        <SearchOutputSection style={{ paddingBottom: "1.5rem" }}>
            <h3 style={{ textAlign: "center" }}>{props.heading}</h3>
            <SubInfo style={{ width: "100%" }}>
                <thead>
                    {tableInstance.getHeaderGroups().map((headElem, i) => {
                        return <tr key={i}>{headElem.headers.map((colElem, i) => {
                            return <TableHeader key={i} colSpan={colElem.colSpan}>{flexRender(
                                colElem.column.columnDef.header,
                                colElem.getContext()
                            )}</TableHeader>
                        })}</tr>
                    })}
                </thead>
                <tbody>
                    {tableInstance.getRowModel().rows.map((rowElem,i)=>{
                        return (<tr id={i}>
                            {rowElem.getVisibleCells().map((cellElem,i)=>{
                                return(
                                    <TableEntry key={i}>
                                        {flexRender(
                                            cellElem.column.columnDef.cell,
                                            cellElem.getContext()
                                        )}
                                    </TableEntry>
                                )
                            })}
                        </tr>)
                    })}
                </tbody>
            </SubInfo>
        </SearchOutputSection>
    )
}