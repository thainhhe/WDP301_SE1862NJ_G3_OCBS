import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell,
    Pagination, CircularProgress, Typography, Checkbox, Select, MenuItem, TableSortLabel
} from '@mui/material';

import TableToolbar from './TableToolbar';
import { useDebounce } from '@hooks/useDebounce.js';

/**
 * A reusable data table component with sorting, filtering, searching, pagination, and selection.
 * @param {object} props - The component props.
 * @param {Function} props.fetchData - The async function to fetch data from the API.
 * @param {Array<object>} props.columns - The configuration for table columns.
 * @param {string} props.entityName - The name of the entity being displayed (e.g., "User").
 * @param {string} [props.entityKey='_id'] - The unique key for each data row.
 * @param {Array<object>} props.filterOptions - Configuration for filter dropdowns.
 * @param {string} props.searchPlaceholder - Placeholder text for the search input.
 * @param {Function} [props.onAdd] - Callback function for the "Add New" button.
 * @param {Function} [props.onRowClick] - Callback function when a row is clicked.
 */
const DataTable = ({
                       fetchData,
                       columns,
                       entityName,
                       entityKey = '_id',
                       filterOptions,
                       searchPlaceholder,
                       onAdd,
                       onRowClick, // <-- Prop mới để xử lý click hàng
                   }) => {
    // const navigate = useNavigate(); // <-- Bỏ đi

    // Data and Loading State
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({});
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Sorting State
    const [order, setOrder] = useState(''); // 'asc' or 'desc'
    const [orderBy, setOrderBy] = useState(''); // column id

    // Selection State
    const [selected, setSelected] = useState([]);

    // --- DATA FETCHING ---
    const fetchDataCallback = useCallback(async () => {
        setLoading(true);
        setSelected([]);
        try {
            const params = {
                page,
                limit: rowsPerPage,
                search: debouncedSearchQuery,
                sortBy: orderBy,
                sortOrder: order,
                ...filters,
            };
            const res = await fetchData(params);
            setData(res.data.users);
            setTotal(res.data.total);
        } catch (error) {
            console.error(`Error fetching ${entityName}:`, error);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, debouncedSearchQuery, filters, order, orderBy, fetchData, entityName]);

    useEffect(() => {
        fetchDataCallback();
    }, [fetchDataCallback]);

    // --- EVENT HANDLERS ---
    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(1);
    };

    const handleFilterChange = (filterId, value) => {
        setFilters(prev => ({ ...prev, [filterId]: value }));
        setPage(1);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const handleSortRequest = (property) => {
        const isCurrentColumn = orderBy === property;
        if (isCurrentColumn && order === 'asc') {
            setOrder('desc');
        } else if (isCurrentColumn && order === 'desc') {
            setOrder('');
            setOrderBy('');
        } else {
            setOrder('asc');
            setOrderBy(property);
        }
        setPage(1);
    };

    // Sửa lại handler này
    const handleRowClick = (id) => {
        if (onRowClick) {
            onRowClick(id); // Gọi hàm được truyền từ component cha
        }
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked && data.length > 0) {
            const newSelected = data.map((n) => n[entityKey]);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleSelectClick = (event, id) => {
        event.stopPropagation();
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];
        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        setSelected(newSelected);
    };

    const handleDeleteSelected = () => {
        console.log('Deleting:', selected);
        // Implement API call to delete selected items here
        setSelected([]);
        fetchDataCallback();
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;
    const pageCount = Math.ceil(total / rowsPerPage);

    // --- RENDER ---
    return (
        <Paper sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
            <TableToolbar
                entityName={entityName}
                searchPlaceholder={searchPlaceholder}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                filterOptions={filterOptions}
                filters={filters}
                onFilterChange={handleFilterChange}
                onAdd={onAdd}
                numSelected={selected.length}
                onDeleteSelected={handleDeleteSelected}
            />
            <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <TableContainer>
                    <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                        <TableHead>
                            <TableRow sx={{ '& th': { backgroundColor: 'action.hover', fontWeight: 'bold' } }}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        indeterminate={selected.length > 0 && selected.length < data.length}
                                        checked={data.length > 0 && selected.length === data.length}
                                        onChange={handleSelectAllClick}
                                    />
                                </TableCell>
                                {columns.map((col) => (
                                    <TableCell key={col.id} sortDirection={orderBy === col.id ? order : false}>
                                        {col.sortable ? (
                                            <TableSortLabel
                                                active={orderBy === col.id && !!order}
                                                direction={orderBy === col.id ? order : 'asc'}
                                                onClick={() => handleSortRequest(col.id)}
                                            >
                                                {col.label}
                                            </TableSortLabel>
                                        ) : (
                                            col.label
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={columns.length + 1} align="center"><CircularProgress /></TableCell></TableRow>
                            ) : data.length === 0 ? (
                                <TableRow><TableCell colSpan={columns.length + 1} align="center"><Typography>No {entityName} found.</Typography></TableCell></TableRow>
                            ) : (
                                data.map((item) => {
                                    const isItemSelected = isSelected(item[entityKey]);
                                    return (
                                        <TableRow
                                            hover
                                            onClick={() => handleRowClick(item[entityKey])} // Sử dụng handler đã sửa
                                            role="button"
                                            tabIndex={-1}
                                            key={item[entityKey]}
                                            selected={isItemSelected}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding="checkbox" onClick={(event) => handleSelectClick(event, item[entityKey])}>
                                                <Checkbox color="primary" checked={isItemSelected} />
                                            </TableCell>
                                            {columns.map((col) => (
                                                <TableCell key={col.id}>
                                                    {col.render ? col.render(item) : item[col.id]}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {pageCount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>Rows per page:</Typography>
                        <Select
                            value={rowsPerPage}
                            onChange={handleChangeRowsPerPage}
                            size="small"
                            variant="outlined"
                        >
                            {[5, 10, 25, 50].map(val => <MenuItem key={val} value={val}>{val}</MenuItem>)}
                        </Select>
                    </Box>
                    <Pagination
                        count={pageCount}
                        page={page}
                        onChange={handleChangePage}
                        showFirstButton
                        showLastButton
                        color="primary"
                        sx={{ '& .MuiPaginationItem-previousNext': { display: 'none' } }}
                    />
                </Box>
            )}
        </Paper>
    );
};

export default DataTable;
