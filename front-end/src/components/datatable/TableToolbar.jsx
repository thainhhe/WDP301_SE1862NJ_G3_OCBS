import React from 'react';
import { Toolbar, Typography, Box, TextField, InputAdornment, Button, Select, MenuItem, FormControl, InputLabel, Tooltip, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const TableToolbar = ({
                          entityName,
                          searchPlaceholder,
                          searchQuery,
                          onSearchChange,
                          filterOptions,
                          filters,
                          onFilterChange,
                          onAdd,
                          numSelected,
                          onDeleteSelected,
                      }) => {
    const isItemSelected = numSelected > 0;

    return (
        <Toolbar
            sx={{
                p: 2, // Thêm padding chung
                mb: 2,
                borderRadius: 1.5,
                // Thay đổi giao diện khi có item được chọn
                ...(isItemSelected && {
                    color: 'text.primary',
                    bgcolor: 'action.selected',
                    border: '1px solid',
                    borderColor: 'divider',
                }),
            }}
        >
            {isItemSelected ? (
                // Giao diện khi có item được chọn (đã được làm đẹp)
                <>
                    <Typography sx={{ flex: '1 1 100%', fontWeight: 'bold' }} variant="subtitle1">
                        {numSelected} selected
                    </Typography>
                    <Tooltip title="Delete selected items">
                        <IconButton onClick={onDeleteSelected}>
                            <DeleteIcon color="error" />
                        </IconButton>
                    </Tooltip>
                </>
            ) : (
                // Giao diện mặc định
                <>
                    <Box sx={{ flex: '1 1 100%', display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            variant="outlined"
                            size="small"
                            value={searchQuery}
                            onChange={onSearchChange}
                            placeholder={searchPlaceholder || `Search ${entityName}...`}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: '300px', flexGrow: 1 }}
                        />
                        {filterOptions?.map((filter) => (
                            <FormControl key={filter.id} size="small" sx={{ minWidth: 120 }}>
                                <InputLabel>{filter.label}</InputLabel>
                                <Select
                                    value={filters[filter.id] || ''}
                                    label={filter.label}
                                    onChange={(e) => onFilterChange(filter.id, e.target.value)}
                                >
                                    <MenuItem value=""><em>All</em></MenuItem>
                                    {filter.options.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ))}
                    </Box>

                    {onAdd && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={onAdd}
                            sx={{ ml: 2, whiteSpace: 'nowrap' }}
                        >
                            Add {entityName}
                        </Button>
                    )}
                </>
            )}
        </Toolbar>
    );
};

export default TableToolbar;
