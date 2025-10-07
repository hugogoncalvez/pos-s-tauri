import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Checkbox,
    FormControlLabel,
    Tooltip,
    IconButton,
    InputAdornment,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { UseFetchQuery } from '../hooks/useQuery';
import { useForm } from '../hooks/useForm';
import JsBarcode from 'jsbarcode';
import { Print as PrintIcon, Clear as ClearIcon } from '@mui/icons-material';
import BarcodePrinterSkeleton from '../styledComponents/skeletons/BarcodePrinterSkeleton';

const BarcodePrinter = () => {
    const theme = useTheme();
    const printRef = useRef();

    const [selectedItems, setSelectedItems] = useState([]);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');

    const [filters, handleFilterChange, resetFilters] = useForm({
        presentationSearch: '',
        comboSearch: '',
        promotionSearch: '',
        presentationCategory: '',
        promotionType: ''
    });

    // Fetch data for Presentations, Combos, and Promotions
    const { data: presentationsData, isLoading: isLoadingPresentations, isError: isErrorPresentations, error: errorPresentations } = UseFetchQuery(
        ['allPresentations', filters.presentationSearch, filters.presentationCategory],
        `/presentations?search=${filters.presentationSearch}&category_id=${filters.presentationCategory}`,
        true
    );
    const { data: combosData, isLoading: isLoadingCombos, isError: isErrorCombos, error: errorCombos } = UseFetchQuery(
        ['allCombos', filters.comboSearch],
        `/combos?search=${filters.comboSearch}`,
        true
    );

    const { data: categoriesData, isLoading: isLoadingCategories } = UseFetchQuery('categories', '/category', true);

    const showSnackbar = (message, severity) => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleCheckboxChange = useCallback((item, type) => {
        setSelectedItems(prevSelected => {
            const existingIndex = prevSelected.findIndex(
                selected => selected.id === item.id && selected.type === type
            );

            if (existingIndex > -1) {
                return prevSelected.filter(
                    (selected, index) => index !== existingIndex
                );
            } else {
                return [...prevSelected, { ...item, type }];
            }
        });
    }, []);

    const generateBarcode = useCallback((barcodeValue, format = 'EAN13') => {
        if (barcodeValue) {
            try {
                const canvas = document.createElement('canvas');
                JsBarcode(canvas, barcodeValue, {
                    format: format,
                    displayValue: true,
                    fontSize: 14,
                    height: 40,
                    width: 1.8,
                    margin: 5,
                    background: "#ffffff",
                    lineColor: "#000000",
                });
                return canvas.toDataURL("image/png");
            } catch (e) {
                console.error("Error generating barcode:", e);
                if (format === 'EAN13' && barcodeValue.length !== 13) {
                    try {
                        const canvas = document.createElement('canvas');
                        JsBarcode(canvas, barcodeValue, {
                            format: "CODE128",
                            displayValue: true,
                            fontSize: 14,
                            height: 40,
                            width: 1.8,
                            margin: 5,
                            background: "#ffffff",
                            lineColor: "#000000",
                        });
                        return canvas.toDataURL("image/png");
                    } catch (err) {
                        console.error("Error generating CODE128 barcode:", err);
                        return '';
                    }
                }
                return '';
            }
        }
        return '';
    }, []);

    const BarcodeDisplay = ({ value, description, type }) => {
        const [barcodeImage, setBarcodeImage] = useState('');

        useEffect(() => {
            const imageUrl = generateBarcode(value, type === 'presentation' ? 'EAN13' : 'CODE128');
            setBarcodeImage(imageUrl);
        }, [value, description, type, generateBarcode]);

        return (
            <Box className="barcode-item">
                <Typography className="description">
                    {description}
                </Typography>
                {barcodeImage ? (
                    <img src={barcodeImage} alt="barcode" />
                ) : (
                    <CircularProgress size={20} />
                )}
            </Box>
        );
    };

    const handlePrint = () => {
        if (selectedItems.length === 0) {
            showSnackbar('Selecciona al menos un código de barras para imprimir.', 'warning');
            return;
        }

        try {
            const printContent = printRef.current;
            if (!printContent) {
                showSnackbar('Error: No se pudo obtener el contenido para imprimir.', 'error');
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Imprimir Códigos de Barras</title>
                    <meta charset="UTF-8">
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body { 
                            font-family: Arial, sans-serif; 
                            margin: 0; 
                            padding: 15px;
                            background: white;
                        }
                        
                        .print-container {
                            width: 100%;
                        }
                        
                        .barcode-group {
                            width: 100%;
                            margin-bottom: 25px;
                            page-break-inside: avoid;
                        }
                        
                        .barcode-group:not(:last-child) {
                            page-break-after: auto;
                        }
                        
                        .group-title {
                            font-size: 1.3rem;
                            font-weight: bold;
                            margin-bottom: 15px;
                            text-align: center;
                            color: #333;
                            border-bottom: 2px solid #ddd;
                            padding-bottom: 8px;
                        }
                        
                        .barcode-grid {
                            display: grid;
                            grid-template-columns: repeat(3, 1fr);
                            gap: 15px;
                            width: 100%;
                        }
                        
                        .barcode-item {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 10px;
                            border: 1px solid #ddd;
                            border-radius: 6px;
                            background: white;
                            min-height: 120px;
                            page-break-inside: avoid;
                        }
                        
                        .description {
                            font-size: 0.75rem;
                            font-weight: 500;
                            text-align: center;
                            margin-bottom: 8px;
                            line-height: 1.3;
                            color: #333;
                            word-wrap: break-word;
                            hyphens: auto;
                            max-width: 100%;
                            min-height: 30px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        }
                        
                        img {
                            max-width: 100%;
                            height: auto;
                            margin-top: auto;
                        }
                        
                        @media print {
                            body { 
                                -webkit-print-color-adjust: exact; 
                                print-color-adjust: exact; 
                                margin: 10px !important;
                                font-size: 12px;
                            }
                            .barcode-group { page-break-inside: avoid; margin-bottom: 20px; }
                            .barcode-item {
                                border: 1px solid #000 !important;
                                background: white !important;
                                margin: 0;
                                break-inside: avoid;
                            }
                            .description { color: #000 !important; font-size: 0.7rem !important; }
                            .group-title { color: #000 !important; border-bottom: 2px solid #000 !important; }
                            img { filter: none !important; }
                        }
                        
                        @media screen and (max-width: 768px) {
                            .barcode-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                        }
                        
                        @media screen and (max-width: 480px) {
                            .barcode-grid { grid-template-columns: 1fr; gap: 8px; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
                </html>
            `;

            const printDocument = iframe.contentDocument || iframe.contentWindow.document;

            iframe.onload = () => {
                const waitForImages = new Promise((resolve) => {
                    const images = printDocument.querySelectorAll('img');
                    if (images.length === 0) {
                        resolve();
                        return;
                    }
                    let loadedImages = 0;
                    const imageCount = images.length;
                    images.forEach((img) => {
                        if (img.complete) {
                            loadedImages++;
                        } else {
                            img.onload = () => {
                                loadedImages++;
                                if (loadedImages === imageCount) resolve();
                            };
                            img.onerror = () => {
                                loadedImages++;
                                if (loadedImages === imageCount) resolve();
                            };
                        }
                    });
                    if (loadedImages === imageCount) {
                        resolve();
                    } else {
                        setTimeout(resolve, 3000); // Safety timeout
                    }
                });

                waitForImages.then(() => {
                    setTimeout(() => {
                        try {
                            iframe.contentWindow.focus();
                            iframe.contentWindow.print();
                        } catch (error) {
                            console.error('Error during print:', error);
                            showSnackbar('Error durante el proceso de impresión.', 'error');
                        } finally {
                            setTimeout(() => {
                                if (iframe.parentNode) {
                                    iframe.parentNode.removeChild(iframe);
                                }
                            }, 1000);
                        }
                    }, 200);
                });
            };

            printDocument.open();
            printDocument.write(htmlContent);
            printDocument.close();

        } catch (error) {
            console.error('Error al configurar la impresión:', error);
            showSnackbar('Error al configurar la impresión.', 'error');
        }
    };

    const groupedItems = selectedItems.reduce((acc, item) => {
        if (!acc[item.type]) {
            acc[item.type] = [];
        }
        acc[item.type].push(item);
        return acc;
    }, {});

    const renderLoading = () => (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Cargando datos...</Typography>
        </Box>
    );

    const renderError = (error) => (
        <Alert severity="error" sx={{ mt: 4 }}>
            Error al cargar datos: {error?.message || 'Error desconocido'}
        </Alert>
    );

    const isPageLoading = isLoadingPresentations || isLoadingCombos || isLoadingCategories;

    if (isPageLoading) {
        return <BarcodePrinterSkeleton />;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2, background: (theme) => theme.palette.background.componentHeaderBackground, color: theme.palette.primary.contrastText }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid>
                        <Typography variant="h4" gutterBottom>Imprimir Códigos de Barras</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>Genera e imprime códigos de barras para tus productos y combos.</Typography>
                    </Grid>
                    <Grid>
                        <StyledButton variant="outlined" onClick={handlePrint} startIcon={<PrintIcon />}>
                            Imprimir Seleccionados
                        </StyledButton>
                    </Grid>
                </Grid>
            </Paper>

            <StyledCard sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Seleccionar Elementos</Typography>
                <Grid container spacing={2}>
                    {/* Presentations Filter */}
                    <Grid item xs={12} sm={6} md={6}>
                        <StyledTextField
                            label="Buscar Presentación"
                            name="presentationSearch"
                            value={filters.presentationSearch || ''}
                            onChange={handleFilterChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => handleFilterChange({ target: { name: 'presentationSearch', value: '' } })}><ClearIcon /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <StyledAutocomplete
                            options={Array.isArray(categoriesData) ? categoriesData : []}
                            getOptionLabel={(option) => option.name || ''}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(event, value) => handleFilterChange({ target: { name: 'presentationCategory', value: value ? value.id : '' } })}
                            value={categoriesData?.find(cat => cat.id === filters.presentationCategory) || null}
                            renderInput={(params) => (
                                <StyledTextField
                                    {...params}
                                    label="Filtrar por Categoría"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => handleFilterChange({ target: { name: 'presentationCategory', value: '' } })}><ClearIcon /></IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>

                    {/* Combos Filter */}
                    <Grid item xs={12} sm={6} md={6}>
                        <StyledTextField
                            label="Buscar Combo"
                            name="comboSearch"
                            value={filters.comboSearch || ''}
                            onChange={handleFilterChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => handleFilterChange({ target: { name: 'comboSearch', value: '' } })}><ClearIcon /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 3 }}>
                    {/* Presentations List */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Presentaciones</Typography>
                        {isLoadingPresentations && renderLoading()}
                        {isErrorPresentations && renderError(errorPresentations)}
                        {!isLoadingPresentations && !isErrorPresentations && presentationsData?.presentations?.length === 0 && (
                            <Typography>No hay presentaciones disponibles.</Typography>
                        )}
                        <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', p: 1 }}>
                            {presentationsData?.presentations?.map(item => (
                                <FormControlLabel
                                    key={item.id}
                                    control={
                                        <Checkbox
                                            checked={selectedItems.some(
                                                selected => selected.id === item.id && selected.type === 'presentation'
                                            )}
                                            onChange={() => handleCheckboxChange(item, 'presentation')}
                                        />
                                    }
                                    label={`${item.name} (${item.barcode})`}
                                />
                            ))}
                        </Box>
                    </Grid>

                    {/* Combos List */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Combos</Typography>
                        {isLoadingCombos && renderLoading()}
                        {isErrorCombos && renderError(errorCombos)}
                        {!isLoadingCombos && !isErrorCombos && combosData?.length === 0 && (
                            <Typography>No hay combos disponibles.</Typography>
                        )}
                        <Box sx={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #eee', p: 1 }}>
                            {combosData?.map(item => (
                                <FormControlLabel
                                    key={item.id}
                                    control={
                                        <Checkbox
                                            checked={selectedItems.some(
                                                selected => selected.id === item.id && selected.type === 'combo'
                                            )}
                                            onChange={() => handleCheckboxChange(item, 'combo')}
                                        />
                                    }
                                    label={`${item.name} (${item.barcode})`}
                                />
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </StyledCard>

            <Paper elevation={3} sx={{ p: 2, mt: 3 }}>
                <Typography variant="h6" gutterBottom>Códigos de Barras Seleccionados para Imprimir</Typography>
                <Box ref={printRef} className="print-container">
                    {selectedItems.length === 0 ? (
                        <Box sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc' }}>
                            <Typography color="textSecondary">No hay elementos seleccionados para imprimir.</Typography>
                        </Box>
                    ) : (
                        <>
                            {groupedItems.presentation && groupedItems.presentation.length > 0 && (
                                <Box className="barcode-group">
                                    <Typography variant="h6" className="group-title">Presentaciones</Typography>
                                    <Box className="barcode-grid">
                                        {groupedItems.presentation.map(item => (
                                            <BarcodeDisplay
                                                key={item.id}
                                                value={item.barcode}
                                                description={`${item.name} - ${item.productDescription || ''}`}
                                                type="presentation"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                            {groupedItems.combo && groupedItems.combo.length > 0 && (
                                <Box className="barcode-group">
                                    <Typography variant="h6" className="group-title">Combos</Typography>
                                    <Box className="barcode-grid">
                                        {groupedItems.combo.map(item => (
                                            <BarcodeDisplay
                                                key={item.id}
                                                value={item.barcode}
                                                description={item.name}
                                                type="combo"
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            </Paper>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BarcodePrinter;