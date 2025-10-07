import { useTheme } from '@mui/material/styles';
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  CircularProgress,
  alpha,
  IconButton // Added IconButton
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../styles/styles';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };

  const handleBackButtonClick = (event) => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = (event) => {
    onPageChange(event, page + 1);
  };

  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <LastPageIcon /> : <FirstPageIcon />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <FirstPageIcon /> : <LastPageIcon />}
      </IconButton>
    </Box>
  );
}

/**
 * Un componente de tabla reutilizable y controlado con paginación del lado del servidor y estado de carga.
 *
 * @param {array} columns - Definición de las columnas. Ej: [{ id: 'name', label: 'Nombre', cellStyle: (row) => ({ color: 'red' }) }]
 * @param {array} data - Los datos a mostrar en la página actual.
 * @param {boolean} loading - Si es true, muestra un indicador de carga sobre la tabla.
 * @param {number} count - El número total de filas en la base de datos (para la paginación).
 * @param {number} page - El índice de la página actual (controlado por el componente padre).
 * @param {number} rowsPerPage - El número de filas por página (controlado por el componente padre).
 * @param {function} onPageChange - Callback para manejar el cambio de página, recibe (event, newPage).
 * @param {function} onRowsPerPageChange - Callback para manejar el cambio de filas por página.
 */
export const EnhancedTable = ({
  columns,
  data,
  loading = false,
  count = 0,
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange,
  renderRow, // Nueva prop para renderizado personalizado
  pagination = true // Prop para controlar la visibilidad de la paginación
}) => {
  const theme = useTheme();

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', position: 'relative' }}>
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.background.paper, 0.7),
            zIndex: 2,
          }}
        >
          <CircularProgress />
        </Box>
      )}
      <TableContainer>
        <Table stickyHeader size="small" aria-label="enhanced table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell key={column.id} align={column.align || 'center'}>
                  {column.label}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading && data.length > 0 ? (
              // Si se proporciona una función de renderizado de fila personalizada, úsala.
              renderRow ? (
                data.map((row, index) => renderRow(row, index))
              ) : (
                // Lógica de renderizado de fila por defecto.
                data.map((row, index) => (
                  <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id || row.temp_id || index}>
                    {columns.map((column) => {
                      let value = column.valueGetter ? column.valueGetter({ row }) : row[column.id];
                      const style = column.cellStyle ? column.cellStyle(row) : {};
                      const formattedValue = column.format ? column.format(value) : value;

                      return (
                        <StyledTableCell key={column.id} align={column.align || 'center'} sx={{ ...style, py: '6px' }}>
                          {formattedValue !== undefined && formattedValue !== null ? formattedValue : ''}
                        </StyledTableCell>
                      );
                    })}
                  </StyledTableRow>
                ))
              )
            ) : (
              <TableRow>
                <StyledTableCell colSpan={columns.length} align="center">
                  <Typography variant="subtitle1" sx={{ p: 3 }}>
                    {loading ? 'Cargando datos...' : 'No se encontraron resultados.'}
                  </Typography>
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        //esto agrego chatGpt
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={count}
          rowsPerPage={rowsPerPage}
          page={Math.min(page, Math.max(0, Math.ceil(count / rowsPerPage) - 1))} // ✅ clamp
          onPageChange={(event, newPage) => {
            if (!loading) {
              onPageChange(event, newPage);
            }
          }}
          onRowsPerPageChange={onRowsPerPageChange}
          labelRowsPerPage={'Filas por página:'}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          ActionsComponent={TablePaginationActions}
        />

      )}
    </Paper>
  );
};
