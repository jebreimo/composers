import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import {visuallyHidden} from '@mui/utils';
import Box from '@mui/material/Box'; // Box must be imported last to avoid a bug in the MUI library (theme initialization).
import {IComposer} from "./FindComposers.ts";
import {makeGoogleQuery} from "./MakeGoogleQuery.ts";

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof never>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

interface HeadCell {
    disablePadding: boolean;
    id: keyof IComposer;
    label: string;
    numeric: boolean;
    width: string;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'surname',
        numeric: false,
        disablePadding: true,
        label: 'Etternavn',
        width: "15%"
    },
    {
        id: 'givenName',
        numeric: false,
        disablePadding: true,
        label: 'For- og mellomnavn',
        width: "20%"
    },
    {
        id: 'country',
        numeric: false,
        disablePadding: true,
        label: 'Nasjonalitet',
        width: "15%"
    },
    {
        id: 'birth',
        numeric: true,
        disablePadding: false,
        label: 'Født',
        width:"5%"
    },
    {
        id: 'death',
        numeric: true,
        disablePadding: false,
        label: 'Død',
        width: "5%"
    },
    {
        id: 'note',
        numeric: false,
        disablePadding: true,
        label: 'Kommentar',
        width: "40%"
    },
];

interface ComposerTableHeadProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof IComposer) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

function ComposerTableHead(props: ComposerTableHeadProps) {
    const {
        order,
        orderBy,
        // rowCount,
        onRequestSort
    } = props;
    const createSortHandler =
        (property: keyof IComposer) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                        width={headCell.width}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

export interface ComposerTableProps {
    composers: IComposer[];
}

export default function ComposerTable(props: ComposerTableProps) {
    const [order, setOrder] = React.useState<Order>('asc');
    const [orderBy, setOrderBy] = React.useState<keyof IComposer>('surname');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);

    const handleComposersChanged = () => {
        setPage(0);
    };

    React.useEffect(() => {
        handleComposersChanged();
    }, [props.composers]);

    const handleRequestSort = (
        _ev: React.MouseEvent<unknown>,
        property: keyof IComposer,
    ) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (_ev: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(ev.target.value, 10));
        setPage(0);
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - props.composers.length) : 0;

    const visibleRows = React.useMemo(
        () =>
            props.composers.sort(getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            ),
        [order, orderBy, page, rowsPerPage, props.composers],
    );

    return (
        <Box sx={{width: '90%'}}>
            <Paper sx={{width: '100%', mb: 2}}>
                {/*<EnhancedTableToolbar/>*/}
                <TableContainer>
                    <Table
                        sx={{minWidth: 750}}
                        aria-labelledby="tableTitle"
                        size={'small'}
                    >
                        <ComposerTableHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={props.composers.length}
                        />
                        <TableBody>
                            {visibleRows.map(makeTableRow)}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 33 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6}/>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={props.composers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );

    function makeTableRow(row: IComposer, index: number) {
        const labelId = `enhanced-table-checkbox-${index}`;
        const queryUrl = makeGoogleQuery(row.givenName, row.surname);
        return (
            <TableRow
                hover
                role="checkbox"
                aria-checked={false}
                tabIndex={-1}
                key={row.id}
                selected={false}
                sx={{cursor: 'pointer'}}
            >
                <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                    padding="none"
                >
                    <a href={queryUrl} target="_blank" rel="noopener noreferrer">{row.surname}</a>
                </TableCell>
                <TableCell>
                    <a href={queryUrl} target="_blank" rel="noopener noreferrer">{row.givenName}</a>
                </TableCell>
                <TableCell>{row.country}</TableCell>
                <TableCell align="right">{row.birth}</TableCell>
                <TableCell align="right">{row.death}</TableCell>
                <TableCell>{row.note}</TableCell>
            </TableRow>
        );
    }
}
