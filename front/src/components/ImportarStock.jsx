import React, { useState, useRef } from 'react';
import { Box, Typography, Paper, Container, Grid, Alert, Chip, useTheme, useMediaQuery } from '@mui/material';
import { UploadFile as UploadFileIcon, Download as DownloadIcon, Task as ProcessIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { useSubmit } from '../hooks/useSubmit';
import { StyledButton } from '../styledComponents/ui/StyledButton';

const ImportarStock = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const { mutate: submit, isLoading, error } = useSubmit('/stock/importar', true);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
      setImportResult(null);
    } else {
      alert("Por favor, selecciona un archivo CSV o Excel.");
      setSelectedFile(null);
      setImportResult(null);
    }
  };

  const handleSelectFileClick = () => {
    fileInputRef.current.click();
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        codigo_barras: '7790010001234',
        nombre: 'Producto Ejemplo',
        descripcion: 'Breve descripción del producto',
        costo: 100.50,
        precio: 150.75,
        stock: 50,
        min_stock: 10,
        tipo_venta: 'unitario',
        unidad: 'Unidad',
        categoria: 'General',
        proveedor: 'Proveedor Ejemplo'
      }
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla');

    worksheet['!cols'] = [
      { wch: 20 }, { wch: 30 }, { wch: 40 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
    ];

    XLSX.writeFile(workbook, 'Plantilla_Importacion_Stock.xlsx');
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await submit(formData);
    setImportResult(response);
    setSelectedFile(null);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: (theme) => theme.palette.background.componentHeaderBackground,
          color: theme.palette.primary.contrastText
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Importación Masiva de Stock
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Siga las instrucciones para importar productos de forma masiva.
        </Typography>
      </Paper>

      <Paper elevation={3} sx={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>Instrucciones:</strong>
          <ol>
            <li>Descargue la plantilla de Excel para asegurarse de que el formato de los datos sea el correcto.</li>
            <li>Rellene la plantilla con sus productos. No modifique los nombres de las columnas.</li>
            <li>Seleccione el archivo completado y haga clic en "Procesar Archivo".</li>
          </ol>
        </Alert>

        <Grid container spacing={3} alignItems="center" justifyContent="center">
          <Grid item xs={12} md={4}>
            <StyledButton
              fullWidth
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTemplate}
            >
              Descargar Plantilla
            </StyledButton>
          </Grid>
          <Grid item xs={12} md={4}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              style={{ display: 'none' }}
            />
            <StyledButton
              fullWidth
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={handleSelectFileClick}
            >
              Seleccionar Archivo
            </StyledButton>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledButton
              fullWidth
              variant="contained"
              startIcon={<ProcessIcon />}
              onClick={handleProcessFile}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? 'Procesando...' : 'Procesar Archivo'}
            </StyledButton>
          </Grid>
        </Grid>

        {selectedFile && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body1">Archivo seleccionado:</Typography>
            <Chip label={selectedFile.name} onDelete={() => setSelectedFile(null)} sx={{ mt: 1 }} />
          </Box>
        )}

        {isLoading && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Procesando importación... Esto puede tardar unos segundos.
          </Alert>
        )}

        {importResult && (
          <Alert severity={importResult.errors > 0 || error ? "error" : "success"} sx={{ mt: 3 }}>
            <Typography variant="h6">Resultado de la Importación:</Typography>
            {importResult.message && <Typography>{importResult.message}</Typography>}
            {importResult.imported !== undefined && <Typography>Registros importados: {importResult.imported}</Typography>}
            {importResult.updated !== undefined && <Typography>Registros actualizados: {importResult.updated}</Typography>}
            {importResult.errors !== undefined && <Typography>Errores encontrados: {importResult.errors}</Typography>}
            {importResult.details && importResult.details.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">Detalles de errores:</Typography>
                <ul>
                  {importResult.details.map((detail, index) => (
                    <li key={index}><Typography variant="body2">{detail}</Typography></li>
                  ))}
                </ul>
              </Box>
            )}
            {error && <Typography>Error en la petición: {error.message || error}</Typography>}
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default ImportarStock;