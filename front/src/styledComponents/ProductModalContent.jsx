import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import validator from 'validator';

import Grid from '@mui/material/Unstable_Grid2';
import {
    Autocomplete,
    Alert,
    Box,
    Typography,
    Divider,
    IconButton,
    InputAdornment,
    Tooltip,
    CircularProgress,
    DialogContent,
    DialogActions,
    Paper
} from '@mui/material';
import {
    Clear as ClearIcon,
    Edit as EditIcon,
    DeleteForever as DeleteForeverIcon,
    Autorenew as AutorenewIcon,
    HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { createFilterOptions } from '@mui/material/Autocomplete';

import { StyledAutocomplete } from './ui/StyledAutocomplete';
import { StyledButton } from './ui/StyledButton';
import { StyledTextField } from './ui/StyledTextField';
import { EnhancedTable } from './EnhancedTable';
import { StyledTableRow, StyledTableCell } from '../styles/styles';

import { useForm } from '../hooks/useForm';
import { UseFetchQuery, UseQueryWithCache } from '../hooks/useQuery';
import { Api } from '../api/api.js';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarConfirmacion } from '../functions/mostrarConfirmacion';

const tipoVentaOptions = [
    { value: 'unitario', label: 'Unitario' },
    { value: 'pesable', label: 'Pesable' }
];

export const ProductModalContent = React.memo(({
    product,
    onSaveProduct,
    onCancel,
    barcodeInputRef,
    setNewSupplierName,
    setSupplierDialogOpen,
    formatCurrency,
    updating,
    guardando
}) => {
    const theme = useTheme();

    // --- Estados para el formulario principal de producto ---
    const [values, handleInputChange, resetForm, , setValues] = useForm(product || {});
    const [barcodeError, setBarcodeError] = useState('');
    const [barcodeWarning, setBarcodeWarning] = useState('');
    const [barcodeSuccess, setBarcodeSuccess] = useState('');
    const [productModalError, setProductModalError] = useState('');
    const [productModalSuccess, setProductModalSuccess] = useState('');
    const [isBarcodeValidated, setIsBarcodeValidated] = useState(true);

    // --- Estados para la gestión de presentaciones ---
    const [presentations, setPresentations] = useState(product?.presentations || []);
    const [presentationValues, handlePresentationInputChange, resetPresentationForm, , setPresentationValues] = useForm();
    const [editingPresentationIndex, setEditingPresentationIndex] = useState(null);
    const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);
    const [nextPresentationBarcodeSequential, setNextPresentationBarcodeSequential] = useState(1);

    // --- Queries de datos ---
    const { data: categoriesData, isLoading: isLoadingCategories } = UseQueryWithCache('categories', '/category', true, 0, { keepPreviousData: true });
    const { data: unitsData, isLoading: isLoadingUnits } = UseQueryWithCache('units', '/units', true, 0, { keepPreviousData: true });
    const { data: suppliersData, isLoading: isLoadingSuppliers } = UseQueryWithCache('suppliers', '/suppliers', true, 0, { keepPreviousData: true });

    const [barcodeToCheck, setBarcodeToCheck] = useState(null);

    // Query para verificar si un código de barras ya existe (en el modal)
    const { data: barcodeCheckData, isFetching: isCheckingBarcode, error: barcodeCheckError } = UseFetchQuery(
        ['checkBarcode', barcodeToCheck],
        async () => {
            if (!barcodeToCheck) {
                return null;
            }
            try {
                const res = await Api.get(`/stock/product-by-barcode/${barcodeToCheck}`);
                return res.data;
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    return null; // No se encontró el producto
                }
                throw err;
            }
        },
        !!barcodeToCheck, // Habilitación dinámica para cualquier código
        0,
        {
            retry: 1,
            retryDelay: 1000
        }
    );

    // Efecto para manejar los resultados de la verificación del código de barras
    useEffect(() => {
        console.info('barcodeCheckData changed:', barcodeCheckData);
        if (barcodeCheckData !== undefined) { // Solo actuar cuando barcodeCheckData ha sido cargado (no undefined)
            if (barcodeCheckData === null) {
                // Producto no encontrado, el código de barras está disponible
                setBarcodeError('');
                setBarcodeSuccess('Código de barras disponible.');
                if (!values.id) { // Si estamos creando un nuevo producto, limpiar si se escribio algo
                    const currentBarcode = values.barcode; // Guardar el código de barras actual
                    resetForm(); // Limpiar todo el formulario
                    setValues(prev => ({ ...prev, barcode: currentBarcode })); // Restaurar solo el código de barras
                    setPresentations([]);
                }
            } else {
                // Producto, presentación o combo encontrado: el código de barras ya está en uso
                if (updating && barcodeCheckData.id === values.id) {
                    setBarcodeError('');
                    setBarcodeSuccess('Código de barras válido para este producto.');
                } else {
                    setBarcodeSuccess(''); // Limpiar mensaje de éxito
                    if (barcodeCheckData.type === 'product') {
                        setBarcodeError('Código de barras ya en uso por otro producto.');
                        console.info('Setting product values:', barcodeCheckData);
                        setValues(barcodeCheckData);
                        setPresentations(barcodeCheckData.presentations || []);
                    } else if (barcodeCheckData.type === 'presentation') {
                        setBarcodeError('Código de barras ya en uso por una presentación de otro producto.');
                        console.info('Setting presentation stock values:', barcodeCheckData.stock);
                        setValues(barcodeCheckData.stock);
                        setPresentations([barcodeCheckData]);
                    } else if (barcodeCheckData.type === 'combo') {
                        setBarcodeError('Código de barras ya en uso por un combo. Los combos no se pueden editar desde aquí.');
                        resetForm();
                        setPresentations([]);
                    }
                }
            }
            setIsBarcodeValidated(true);
        }
    }, [barcodeCheckData, values.id, updating]); // Agregamos values.id a las dependencias para que el efecto se re-ejecute correctamente

    // Efecto para manejar errores en la verificación del código de barras
    useEffect(() => {
        console.info('barcodeCheckError changed:', barcodeCheckError);
        if (barcodeCheckError) {
            if (barcodeCheckError.response && barcodeCheckError.response.status === 404) {
                // No hacer nada, ya que barcodeCheckData manejará el caso de "no encontrado"
            } else {
                setBarcodeError('Error al verificar el código de barras.');
                setBarcodeSuccess(''); // Limpiar cualquier mensaje de éxito
                setIsBarcodeValidated(true);
            }
        }
    }, [barcodeCheckError]);

    // Helper functions...
    const calculateEAN13CheckDigitValidation = useCallback((ean13) => {
        if (!ean13 || ean13.length !== 12 || !/^\d+$/.test(ean13)) return null;
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = parseInt(ean13[i], 10);
            sum += i % 2 === 0 ? digit : digit * 3;
        }
        return (10 - (sum % 10)) % 10;
    }, []);

    const calculateEAN8CheckDigitValidation = useCallback((ean8) => {
        if (!ean8 || ean8.length !== 7 || !/^\d+$/.test(ean8)) return null;
        let sum = 0;
        for (let i = 0; i < 7; i++) {
            const digit = parseInt(ean8[i], 10);
            sum += i % 2 === 0 ? digit * 3 : digit;
        }
        return (10 - (sum % 10)) % 10;
    }, []);

    const calculateUPCACheckDigitValidation = useCallback((upc) => {
        if (!upc || upc.length !== 11 || !/^\d+$/.test(upc)) return null;
        let sum = 0;
        for (let i = 0; i < 11; i++) {
            const digit = parseInt(upc[i], 10);
            sum += i % 2 === 0 ? digit * 3 : digit;
        }
        return (10 - (sum % 10)) % 10;
    }, []);

    // Note: EAN-14 (GTIN-14) uses the same algorithm as EAN-13 but with a different length.
    const calculateEAN14CheckDigitValidation = useCallback((ean14) => {
        if (!ean14 || ean14.length !== 13 || !/^\d+$/.test(ean14)) return null;
        let sum = 0;
        for (let i = 0; i < 13; i++) {
            const digit = parseInt(ean14[i], 10);
            sum += i % 2 === 0 ? digit * 3 : digit;
        }
        return (10 - (sum % 10)) % 10;
    }, []);






    const calculateEAN13CheckDigit = useCallback((barcode) => {
        if (barcode.length !== 12) throw new Error("Input must be 12 digits");
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
        }
        return ((10 - (sum % 10)) % 10).toString();
    }, []);

    const getNextSequentialBarcodeNumber = useCallback((existingBarcodes, prefix) => {
        let maxSequential = 0;
        existingBarcodes.forEach(b => {
            if (b && b.startsWith(prefix) && b.length === 13) {
                const sequentialPart = b.substring(prefix.length, b.length - 1);
                const num = parseInt(sequentialPart, 10);
                if (!isNaN(num) && num > maxSequential) maxSequential = num;
            }
        });
        return maxSequential + 1;
    }, []);

    const checkBarcode = useCallback((barcode) => {
        console.info('checkBarcode called with:', barcode);
        if (barcode) {
            setBarcodeError('');
            setBarcodeSuccess(''); // Clear success message when a new barcode is being checked
            setProductModalError('');
            setIsBarcodeValidated(false);
        }
        setBarcodeToCheck(barcode);
    }, []);

    const handleLocalInputChange = useCallback((e) => {
        if (productModalError) setProductModalError('');
        handleInputChange(e);
    }, [handleInputChange, productModalError]);

    const handleBarcodeChange = useCallback((e) => {
        console.info('handleBarcodeChange called with:', e.target.value);
        const newBarcode = e.target.value.toString().slice(0, 18);
        console.log('handleBarcodeChange - newBarcode:', newBarcode);
        let error = "";
        let warning = "";
        setProductModalError('');
        setBarcodeWarning(''); // Reset warning

        if (newBarcode.length > 0) {
            if (!/^\d+$/.test(newBarcode)) {
                error = "Solo puede contener dígitos numéricos.";
            } else {
                let isValidFormat = false;
                let hasIncorrectCheckDigit = false;

                if (newBarcode.length === 8) {
                    if (calculateEAN8CheckDigitValidation(newBarcode.substring(0, 7)) === parseInt(newBarcode[7], 10)) isValidFormat = true;
                    else hasIncorrectCheckDigit = true;
                } else if (newBarcode.length === 12) {
                    if (calculateUPCACheckDigitValidation(newBarcode.substring(0, 11)) === parseInt(newBarcode[11], 10)) isValidFormat = true;
                    else hasIncorrectCheckDigit = true;
                } else if (newBarcode.length === 13) {
                    if (calculateEAN13CheckDigitValidation(newBarcode.substring(0, 12)) === parseInt(newBarcode[12], 10)) isValidFormat = true;
                    else hasIncorrectCheckDigit = true;
                } else if (newBarcode.length === 14) {
                    if (calculateEAN14CheckDigitValidation(newBarcode.substring(0, 13)) === parseInt(newBarcode[13], 10)) isValidFormat = true;
                    else hasIncorrectCheckDigit = true;
                }

                if (hasIncorrectCheckDigit) {
                    warning = "Dígito de control inválido para el formato.";
                } else if (!isValidFormat) {
                    warning = "Formato no estándar. Recomendados: EAN-8, UPC-A(12), EAN-13, EAN-14.";
                }
            }
        } else { // newBarcode is empty
            setBarcodeError('');
            setBarcodeWarning('');
            setBarcodeSuccess('');
        }

        setBarcodeError(error);
        setBarcodeWarning(warning);
        handleLocalInputChange({ target: { name: 'barcode', value: newBarcode } });

        const validLength = [8, 12, 13, 14].includes(newBarcode.length);

        if (!error && newBarcode && validLength) {
            console.info('Calling checkBarcode from handleBarcodeChange with:', newBarcode);
            checkBarcode(newBarcode);
        } else if (!newBarcode) {
            console.info('Calling checkBarcode from handleBarcodeChange with null (empty barcode):', newBarcode);
            checkBarcode(null);
        }
    }, [handleLocalInputChange, calculateEAN8CheckDigitValidation, calculateEAN13CheckDigitValidation, calculateUPCACheckDigitValidation, calculateEAN14CheckDigitValidation, checkBarcode]);


    const handleBarcodeScan = useCallback((e) => {
        console.info('handleBarcodeScan called with key:', e.key, 'and value:', e.target.value);
        if (e.key === 'Enter') {
            e.preventDefault();
            const barcode = e.target.value.trim();
            if (barcode) {
                console.info('Calling checkBarcode from handleBarcodeScan with:', barcode);
                checkBarcode(barcode);
            }
        }
    }, [checkBarcode]);

    const handleBarcodeBlur = useCallback((e) => {
        const barcode = e.target.value.trim();
        if (barcode) {
            console.info('Calling checkBarcode from handleBarcodeBlur with:', barcode);
            checkBarcode(barcode);
        }
    }, [checkBarcode]);

    const handleGenerateBarcode = useCallback(async () => {
        setIsGeneratingBarcode(true);
        setProductModalError('');
        const prefix = '201';
        let currentSequential = nextPresentationBarcodeSequential;
        let generatedBarcode = '';
        let isGloballyUnique = false;
        let attempts = 0;
        const MAX_ATTEMPTS = 100;

        while (!isGloballyUnique && attempts < MAX_ATTEMPTS) {
            attempts++;
            const sequentialPart = currentSequential.toString().padStart(9, '0');
            const barcodeWithoutCheckDigit = prefix + sequentialPart;
            const checkDigit = calculateEAN13CheckDigit(barcodeWithoutCheckDigit);
            generatedBarcode = barcodeWithoutCheckDigit + checkDigit;
            const isLocallyUnique = !presentations.some(p => p.barcode === generatedBarcode);

            if (isLocallyUnique) {
                try {
                    const { data } = await Api.get(`/barcodes/validate/${generatedBarcode}`);
                    if (!data.exists) {
                        isGloballyUnique = true;
                    } else {
                        currentSequential++;
                    }
                } catch (error) {
                    console.error("Error al validar el código de barras con el backend:", error);
                    setProductModalError('Error al validar el código de barras con el servidor.');
                    setIsGeneratingBarcode(false);
                    return;
                }
            } else {
                currentSequential++;
            }
        }

        if (isGloballyUnique) {
            setPresentationValues(prev => ({ ...prev, barcode: generatedBarcode }));
            setNextPresentationBarcodeSequential(currentSequential + 1);
        } else {
            setProductModalError('No se pudo generar un código de barras único.');
        }
        setIsGeneratingBarcode(false);
    }, [nextPresentationBarcodeSequential, presentations, calculateEAN13CheckDigit]);

    const handleAddPresentation = useCallback(() => {
        const { name, quantity_in_base_units, price } = presentationValues;
        if (!name || !quantity_in_base_units || !price) {
            setProductModalError('Completa los campos Nombre, Cantidad y Precio de la presentación.');
            return;
        }
        const newPresentation = { ...presentationValues };
        if (editingPresentationIndex !== null) {
            const updatedPresentations = [...presentations];
            updatedPresentations[editingPresentationIndex] = newPresentation;
            setPresentations(updatedPresentations);
            setEditingPresentationIndex(null);
        } else {
            setPresentations([...presentations, newPresentation]);
        }
        resetPresentationForm();
        setProductModalError('');
        if (values?.tipo_venta === 'pesable') {
            handlePresentationInputChange({ target: { name: 'quantity_in_base_units', value: 1 } });
        }
    }, [presentationValues, editingPresentationIndex, presentations, resetPresentationForm, values?.tipo_venta]);

    const handleEditPresentation = useCallback((index) => {
        const presentationToEdit = presentations[index];
        if (presentationToEdit) {
            setPresentationValues({
                id: presentationToEdit.id,
                name: presentationToEdit.name,
                quantity_in_base_units: parseFloat(presentationToEdit.quantity_in_base_units),
                price: parseFloat(presentationToEdit.price),
                barcode: presentationToEdit.barcode,
            });
            setEditingPresentationIndex(index);
        }
    }, [presentations]);

    const handleDeletePresentation = useCallback((index) => {
        mostrarConfirmacion(
            {
                title: '¿Estás seguro?',
                text: '¡No podrás revertir esto!',
                icon: 'warning',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            },
            theme,
            () => { // onConfirm
                setPresentations(presentations.filter((_, i) => i !== index));
                mostrarExito('Presentación eliminada correctamente.', theme);
            }
            // onCancel is not needed here as no action is taken
        );
    }, [presentations, theme, setPresentations]);

    const handleSaveProduct = useCallback(async () => {

        if (barcodeError && barcodeError !== 'Verificando...') {
            setProductModalError('Corrige el error del código de barras antes de guardar.');
            return;
        }
        if (isCheckingBarcode) {
            setProductModalError('Verificando código de barras, por favor espera.');
            return;
        }


        const finalValues = { ...values, presentations };
        const camposRequeridos = { name: finalValues.name, stock: finalValues.stock, category_id: finalValues.category_id, units_id: finalValues.units_id, price: finalValues.price, tipo_venta: finalValues.tipo_venta, min_stock: finalValues.min_stock };
        const camposValidos = Object.values(camposRequeridos).every(campo => campo !== undefined && campo !== null && !validator.isEmpty(campo.toString(), { ignore_whitespace: true }));

        if (!camposValidos) {
            setProductModalError('Por favor, comprueba los campos del producto. Todos los campos marcados con * son requeridos.');
            return;
        }

        onSaveProduct(finalValues);
    }, [barcodeError, isCheckingBarcode, values, presentations, onSaveProduct, isBarcodeValidated]);

    useEffect(() => {
        if (product) {
            setValues(product);
            setPresentations(product.presentations || []);
            const existingPresentationBarcodes = (product.presentations || []).map(p => p.barcode).filter(Boolean);
            const nextSeq = getNextSequentialBarcodeNumber(existingPresentationBarcodes, '201');
            setNextPresentationBarcodeSequential(nextSeq);
        } else {
            resetForm();
            setPresentations([]);
            setNextPresentationBarcodeSequential(1);
        }
        setBarcodeError('');
        setBarcodeWarning('');
        setProductModalError('');
        setProductModalSuccess('');
        resetPresentationForm();
        setEditingPresentationIndex(null);
        setIsBarcodeValidated(true);
    }, [product]);

    useEffect(() => {
        if (values?.tipo_venta === 'pesable') {
            handlePresentationInputChange({ target: { name: 'quantity_in_base_units', value: 1 } });
        }
    }, [values?.tipo_venta]);

    useEffect(() => {
        if (barcodeInputRef.current) {
            barcodeInputRef.current.focus();
        }
    }, [barcodeInputRef]);

    useEffect(() => {
        if (productModalSuccess) {
            const timer = setTimeout(() => setProductModalSuccess(''), 1500);
            return () => clearTimeout(timer);
        }
    }, [productModalSuccess]);

    const presentationsColumns = useMemo(() => [
        { id: 'name', label: 'Nombre', align: 'left' },
        { id: 'quantity_in_base_units', label: 'Cant. Base', align: 'right', valueGetter: ({ row }) => (parseFloat(row.quantity_in_base_units) % 1 === 0 ? parseFloat(row.quantity_in_base_units) : parseFloat(row.quantity_in_base_units).toFixed(2)) },
        { id: 'price', label: 'Precio', align: 'right', valueGetter: ({ row }) => formatCurrency(row.price) },
        { id: 'barcode', label: 'Código', align: 'left' },
        { id: 'actions', label: 'Acciones', align: 'center' },
    ], [formatCurrency]);

    const renderPresentationRow = useCallback((row, index) => (
        <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id || index}>
            {presentationsColumns.map((column) => {
                if (column.id === 'actions') {
                    return (
                        <StyledTableCell key={column.id} align={column.align || 'center'}>
                            <Tooltip title='Editar Presentación'>
                                <IconButton size='small' color='info' onClick={() => handleEditPresentation(index)}><EditIcon fontSize='small' /></IconButton>
                            </Tooltip>
                            <Tooltip title='Eliminar Presentación'>
                                <IconButton size='small' color='warning' onClick={() => handleDeletePresentation(index)}><DeleteForeverIcon fontSize='small' /></IconButton>
                            </Tooltip>
                        </StyledTableCell>
                    );
                }
                const value = column.valueGetter ? column.valueGetter({ row }) : row[column.id];
                return <StyledTableCell key={column.id} align={column.align || 'center'}>{value ?? ''}</StyledTableCell>;
            })}
        </StyledTableRow>
    ), [presentationsColumns, handleEditPresentation, handleDeletePresentation]);

    return (
        <>
            <DialogContent>
                {productModalError && <Alert severity="error" sx={{ mb: 2 }}>{productModalError}</Alert>}
                <Grid container spacing={2} sx={{ mt: 0 }} justifyContent="center">
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <StyledTextField
                            inputRef={barcodeInputRef}
                            autoFocus
                            label='Código de Barras'
                            name='barcode'
                            value={values?.barcode || ''}
                            onChange={handleBarcodeChange}
                            onKeyDown={handleBarcodeScan}
                            onBlur={handleBarcodeBlur}
                            inputProps={{ maxLength: 18, inputMode: 'numeric', pattern: '[0-9]*' }}
                            onInput={(e) => { e.target.value = e.target.value.toString().slice(0, 18); }}
                            error={!!barcodeError}
                            helperText={barcodeError || barcodeWarning || barcodeSuccess || (isCheckingBarcode ? 'Verificando...' : '')}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        {isCheckingBarcode ? <CircularProgress size={20} /> : <IconButton onClick={() => handleBarcodeChange({ target: { value: '' } })}><ClearIcon color='error' /></IconButton>}
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <StyledTextField
                            label='Nombre'
                            name='name'
                            value={values?.name || ''}
                            onChange={handleLocalInputChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handleLocalInputChange({ target: { name: 'name', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 20vw, 300px)' }}>
                        <StyledTextField
                            label='Descripción'
                            name='description'
                            value={values?.description || ''}
                            onChange={handleLocalInputChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handleLocalInputChange({ target: { name: 'description', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <Autocomplete
                            options={categoriesData || []}
                            getOptionLabel={(option) => option.name || ''}
                            value={categoriesData?.find(option => option.id === values?.category_id) || null}
                            onChange={(event, newValue) => handleLocalInputChange({ target: { name: 'category_id', value: newValue ? newValue.id : '' } })}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <StyledTextField
                                    {...params}
                                    label="Categoría"
                                    name='category_id'
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton onClick={() => handleLocalInputChange({ target: { name: 'category_id', value: '' } })}><ClearIcon color="error" /></IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(150px, 10vw, 180px)' }}>
                        <StyledTextField
                            label='Stock'
                            name='stock'
                            type='number'
                            value={values?.stock || ''}
                            onChange={handleLocalInputChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handleLocalInputChange({ target: { name: 'stock', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <Autocomplete
                            options={tipoVentaOptions}
                            getOptionLabel={(option) => option.label}
                            value={tipoVentaOptions.find(option => option.value === values?.tipo_venta) || null}
                            onChange={(event, newValue) => handleLocalInputChange({ target: { name: 'tipo_venta', value: newValue ? newValue.value : '' } })}
                            isOptionEqualToValue={(option, value) => option.value === value.value}
                            renderInput={(params) => (
                                <StyledTextField
                                    {...params}
                                    label="Tipo de Venta"
                                    name='tipo_venta'
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton onClick={() => handleLocalInputChange({ target: { name: 'tipo_venta', value: '' } })}><ClearIcon color="error" /></IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <Autocomplete
                            options={unitsData || []}
                            getOptionLabel={(option) => option.name || ''}
                            value={unitsData?.find(option => option.id === values?.units_id) || null}
                            onChange={(event, newValue) => handleLocalInputChange({ target: { name: 'units_id', value: newValue ? newValue.id : '' } })}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <StyledTextField
                                    {...params}
                                    label="Unidad de medida"
                                    name='units_id'
                                    required
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton onClick={() => handleLocalInputChange({ target: { name: 'units_id', value: '' } })}><ClearIcon color="error" /></IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <StyledAutocomplete
                            options={Array.isArray(suppliersData) ? suppliersData : []}
                            getOptionLabel={(option) => {
                                if (typeof option === 'string') return option;
                                if (option.inputValue) return option.nombre;
                                return option.nombre || '';
                            }}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            onChange={(event, newValue) => {
                                if (productModalError) setProductModalError('');
                                if (typeof newValue === 'string') {
                                    setNewSupplierName(newValue);
                                    setSupplierDialogOpen(true);
                                } else if (newValue && newValue.inputValue) {
                                    setNewSupplierName(newValue.inputValue);
                                    setSupplierDialogOpen(true);
                                } else {
                                    handleLocalInputChange({ target: { name: 'supplier_id', value: newValue ? newValue.id : null } });
                                }
                            }}
                            value={suppliersData?.find(s => s.id === values?.supplier_id) || null}
                            filterOptions={(options, params) => {
                                const filter = createFilterOptions({
                                    stringify: option => option.nombre,
                                });
                                const filtered = filter(options, params);
                                const { inputValue } = params;
                                const isExisting = options.some((option) => inputValue === option.nombre);
                                if (inputValue !== '' && !isExisting) {
                                    filtered.push({
                                        inputValue: inputValue,
                                        nombre: `Agregar "${inputValue}"`,
                                    });
                                }
                                return filtered;
                            }}
                            selectOnFocus
                            clearOnBlur
                            handleHomeEndKeys
                            freeSolo
                            renderOption={(props, option) => {
                                const { key, ...rest } = props;
                                return <li key={key} {...rest}>{option.nombre}</li>;
                            }}
                            renderInput={(params) => (
                                <StyledTextField
                                    {...params}
                                    label="Proveedor"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton onClick={() => handleLocalInputChange({ target: { name: 'supplier_id', value: '' } })}><ClearIcon color='error' /></IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <StyledTextField
                            label='Precio de Compra'
                            name='cost'
                            type='number'
                            value={values?.cost || ''}
                            onChange={handleLocalInputChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handleLocalInputChange({ target: { name: 'cost', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <StyledTextField
                            label='Precio de Venta'
                            name='price'
                            type='number'
                            value={values?.price || ''}
                            onChange={handleLocalInputChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handleLocalInputChange({ target: { name: 'price', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 220px)' }}>
                        <StyledTextField
                            label='Stock mínimo'
                            name='min_stock'
                            type='number'
                            value={values?.min_stock || ''}
                            onChange={handleLocalInputChange}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handleLocalInputChange({ target: { name: 'min_stock', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Sección de Presentaciones */}
                <Typography color={theme.palette.text.titlePrimary} variant="h6" gutterBottom>Presentaciones de Venta</Typography>
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                    <Grid sx={{ width: 'clamp(200px, 15vw, 250px)' }}>
                        <StyledTextField
                            label='Nombre Presentación'
                            name='name'
                            value={presentationValues?.name || ''}
                            onChange={handlePresentationInputChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handlePresentationInputChange({ target: { name: 'name', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 250px)' }}>
                        <StyledTextField
                            label='Cantidad en Unidades Base'
                            name='quantity_in_base_units'
                            type='number'
                            value={presentationValues?.quantity_in_base_units ?? ''}
                            onChange={handlePresentationInputChange}
                            disabled={values?.tipo_venta === 'pesable'}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handlePresentationInputChange({ target: { name: 'quantity_in_base_units', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    values?.tipo_venta === 'pesable' && (
                                        <InputAdornment position="end">
                                            <Tooltip title="Para pesables, la cantidad es siempre 1 (ej: 1 horma). El stock se descuenta por peso en la venta.">
                                                <IconButton tabIndex={-1} sx={{ color: theme.palette.info.main }}>
                                                    <HelpOutlineIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </InputAdornment>
                                    )
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 250px)' }}>
                        <StyledTextField
                            label='Precio Presentación'
                            name='price'
                            type='number'
                            value={presentationValues?.price || ''}
                            onChange={handlePresentationInputChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handlePresentationInputChange({ target: { name: 'price', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(200px, 15vw, 250px)' }}>
                        <StyledTextField
                            label='Código de Barras (Presentación)'
                            name='barcode'
                            value={presentationValues?.barcode || ''}
                            onChange={handlePresentationInputChange}
                            onInput={(e) => { e.target.value = e.target.value.toString().slice(0, 13); }}
                            inputProps={{ maxLength: 13, readOnly: true }}
                            InputProps={{
                                readOnly: true, // Add this line
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <IconButton onClick={() => handlePresentationInputChange({ target: { name: 'barcode', value: '' } })}><ClearIcon color='error' /></IconButton>
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Generar Código de Barras">
                                            <IconButton
                                                onClick={handleGenerateBarcode}
                                                disabled={isGeneratingBarcode}
                                            >
                                                {isGeneratingBarcode ? <CircularProgress size={24} /> : <AutorenewIcon />}
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Grid>
                    <Grid sx={{ width: 'clamp(150px, 10vw, 180px)' }}>
                        <StyledButton variant="contained" onClick={handleAddPresentation}>
                            {editingPresentationIndex !== null ? 'Actualizar Presentación' : 'Agregar Presentación'}
                        </StyledButton>
                    </Grid>
                </Grid>

                {presentations.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>Presentaciones Agregadas:</Typography>
                        <EnhancedTable
                            columns={presentationsColumns}
                            data={presentations}
                            loading={false}
                            pagination={false}
                            renderRow={renderPresentationRow}
                        />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Grid container justifyContent="flex-end" sx={{ mt: 2, p: 2 }}>
                    <StyledButton
                        variant="outlined"
                        color="secondary"
                        onClick={onCancel}
                        disabled={guardando}
                        sx={{ padding: '2px 12px', mr: 2 }}
                    >
                        Cancelar
                    </StyledButton>
                    <StyledButton
                        variant="contained"
                        disabled={guardando}
                        onClick={handleSaveProduct}
                    >
                        {guardando ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            updating ? 'Actualizar Producto' : 'Guardar Producto'
                        )}
                    </StyledButton>
                </Grid>
            </DialogActions>
        </>
    );
});