import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useTheme } from '@mui/material/styles';
import { Api } from '../api/api';
import validator from 'validator';
import moment from 'moment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

import Grid from '@mui/material/Unstable_Grid2';
import {
    Alert,
    Box,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    Tooltip,
    CircularProgress,
    MenuItem,
    Menu,
    FormControlLabel,
    Checkbox,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider
} from '@mui/material';
import {
    Edit as EditIcon,
    DeleteForever as DeleteForeverIcon,
    Clear as ClearIcon,
    Print as PrintIcon,
    Close as CloseIcon,
    SaveAs as SaveAsIcon,
    KeyboardArrowDown,
    Addchart as AddchartIcon,
    PlaylistAdd as PlaylistAddIcon
} from '@mui/icons-material';

import { createFilterOptions } from '@mui/material/Autocomplete';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledCard } from '../styledComponents/ui/StyledCard';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { TextFieldWithClear } from '../styledComponents/ui/TextFieldWithClear';
import { StyledDialog } from '../styledComponents/ui/StyledDialog';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { NewSupplierModal } from '../styledComponents/NewSupplierModal';
import { StyledDatePicker } from '../styledComponents/ui/StyledDatePicker';
//import { NewProductModal } from '../styledComponents/NewProductModal';

import { useForm } from '../hooks/useForm';
import { UseFetchQuery } from '../hooks/useQuery';
import { useSubmit } from '../hooks/useSubmit';
import { useDelete } from '../hooks/useDelete';
import { confirmAction } from '../functions/ConfirmDelete';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarCarga } from '../functions/mostrarCarga';
import Swal from 'sweetalert2';
import { debounce } from '../functions/Debounce';
import PurchasesManagerSkeleton from '../styledComponents/skeletons/PurchasesManagerSkeleton';

moment.locale('es');

const PurchasesManager = () => {
    const theme = useTheme();

    // --- Estados para la tabla principal ---
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [totalRows, setTotalRows] = useState(0);
    const [filters, handleFilterChange, resetFilters] = useForm({
        factura: '',
        supplier: '',
        startDate: '',
        endDate: '',
        stock_id: ''
    });

    const [facturaInput, setFacturaInput] = useState('');
    const [supplierInput, setSupplierInput] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (facturaInput !== filters.factura) {
                handleFilterChange({ target: { name: 'factura', value: facturaInput } });
                setPage(0);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [facturaInput, filters.factura, handleFilterChange]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (supplierInput !== filters.supplier) {
                handleFilterChange({ target: { name: 'supplier', value: supplierInput } });
                setPage(0);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [supplierInput, filters.supplier, handleFilterChange]);

    useEffect(() => {
        if (filters.factura === '' && facturaInput !== '') setFacturaInput('');
    }, [filters.factura]);

    useEffect(() => {
        if (filters.supplier === '' && supplierInput !== '') setSupplierInput('');
    }, [filters.supplier]);

    const [barcodeInput, setBarcodeInput] = useState('');
    const [productSearchTerm, setProductSearchTerm] = useState('');

    // --- Estados para el Modal de Compra ---
    const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [isEditingPurchase, setIsEditingPurchase] = useState(false);
    const [purchaseValues, handlePurchaseInputChange, resetPurchaseForm, , setPurchaseValues] = useForm();
    const [itemValues, handleItemInputChange, resetItemForm, , setItemValues] = useForm();
    const [tempItems, setTempItems] = useState([]);
    const [editingItemIndex, setEditingItemIndex] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [modalError, setModalError] = useState('');

    // --- Estados para la visibilidad de secciones y modales ---
    const [openFilterSection, setOpenFilterSection] = useState(false);

    // --- Estados para otros modales ---
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [selectedPurchaseDetails, setSelectedPurchaseDetails] = useState([]);
    const [openNewSupplierModal, setOpenNewSupplierModal] = useState(false);
    const [newSupplierName, setNewSupplierName] = useState('');
    const [openNewProductModal, setOpenNewProductModal] = useState(false);
    const [newProductName, setNewProductName] = useState('');

    // --- Refs para manejo de foco ---
    const quantityInputRef = useRef(null);
    const barcodeInputRef = useRef(null); // New ref for barcode input

    // --- Estados para la visibilidad de columnas ---
    const [columnVisibility, setColumnVisibility] = useState({
        createdAt: true,
        factura: true,
        supplier: true,
        cost: true,
        actions: true,
    });
    const [anchorEl, setAnchorEl] = useState(null);

    // --- Cálculos derivados ---
    const totalCost = useMemo(() => {
        return tempItems.reduce((total, item) => total + parseFloat(item.cost || 0), 0);
    }, [tempItems]);

    const debouncedSetProductSearchTerm = useCallback(
        debounce((newValue) => {
            setProductSearchTerm(newValue);
        }, 500), // 500ms de delay
        []
    );

    // --- Queries de datos ---
    const { data: suppliersData, isLoading: isLoadingSuppliers, refetch: refetchSuppliers } = UseFetchQuery('suppliers', '/suppliers', true, 0);
    const { data: stockData, isLoading: isLoadingStock, refetch: reStock } = UseFetchQuery(
        ['stock', productSearchTerm], // La clave de la query debe incluir el término de búsqueda
        `/stock?limit=100&name=${productSearchTerm}`,
        true,
        0,
        { keepPreviousData: true } // Mantener datos anteriores mientras se carga
    );
    const products = stockData?.products || [];
    const { data: unitsData, isLoading: isLoadingUnits } = UseFetchQuery('units', '/units', true, 0);

    const purchaseQueryParams = new URLSearchParams({
        page: page + 1,
        limit: rowsPerPage,
        ...(filters.factura && { factura: filters.factura }),
        ...(filters.supplier && { supplier: filters.supplier }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.stock_id && { stock_id: filters.stock_id }),
    }).toString();

    const { data: purchasesData, isLoading: isLoadingPurchases, refetch: refetchPurchases } = UseFetchQuery(
        ['purchases', purchaseQueryParams],
        `/purchases?${purchaseQueryParams}`,
        true
    );

    // --- Funcion para imprimir la compra ---

    const handlePrintPurchase = () => {
        if (!selectedPurchase || !selectedPurchaseDetails || selectedPurchaseDetails.length === 0) {
            mostrarError('No hay datos de compra disponibles para imprimir.', theme);
            return;
        }

        try {
            const currentDate = moment().format('DD/MM/YYYY HH:mm');
            const purchaseDate = moment.utc(selectedPurchase.createdAt).format('DD/MM/YYYY');

            const iframe = document.createElement('iframe');
            iframe.style.position = 'absolute';
            iframe.style.width = '0px';
            iframe.style.height = '0px';
            iframe.style.border = 'none';
            iframe.style.visibility = 'hidden';
            document.body.appendChild(iframe);

            let htmlContent = `
            <html>
            <head>
                <title>Detalle de Compra #${selectedPurchase.id}</title>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 20px; color: #333; background: #fff; line-height: 1.4; }
                    .purchase-container { max-width: 800px; margin: 0 auto; background: #fff; border: 2px solid #ddd; border-radius: 8px; overflow: hidden; }
                    .purchase-header { background: #f8f9fa; color: #333; padding: 30px; text-align: center; border-bottom: 2px solid #6c757d; }
                    .company-name { font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #6c757d; }
                    .company-details { font-size: 14px; color: #666; margin-bottom: 20px; }
                    .purchase-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; color: #333; }
                    .purchase-number { font-size: 16px; color: #666; margin-bottom: 5px; }
                    .generated-date { font-size: 12px; color: #999; }
                    .purchase-body { padding: 25px; }
                    .info-section { background: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #6c757d; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .info-item { margin-bottom: 10px; }
                    .info-label { font-weight: 600; color: #555; margin-bottom: 5px; }
                    .info-value { color: #333; font-size: 15px; }
                    .total-highlight { background: #f8f9fa; color: #333; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #6c757d; }
                    .total-amount { font-size: 28px; font-weight: bold; color: #6c757d; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    thead { background: #f8f9fa; border-bottom: 2px solid #6c757d; }
                    th { color: #333; padding: 12px 8px; text-align: left; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ddd; }
                    td { padding: 10px 8px; border-bottom: 1px solid #eee; vertical-align: middle; }
                    tbody tr:nth-child(even) { background-color: #f8f9fa; }
                    .text-right { text-align: right; }
                    .total-row { background: #e9ecef !important; color: #333; font-weight: bold; font-size: 13px; border-top: 2px solid #6c757d; }
                    .total-row td { border-bottom: none; padding: 15px 8px; }
                    .purchase-footer { background: #f8f9fa; padding: 20px; text-align: center; border-top: 2px dashed #ddd; margin-top: 30px; }
                    .footer-info { font-size: 11px; color: #666; line-height: 1.4; }
                    @media print { body { margin: 0; padding: 15px; font-size: 11px; } .purchase-container, .purchase-header, .info-section, .total-highlight, thead, .total-row { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .purchase-container { border: 1px solid #000; } .purchase-header { background: #f8f9fa !important; border-bottom: 1px solid #000 !important; } .info-section { background: #f8f9fa !important; border-left: 2px solid #000 !important; } .total-highlight { background: #f8f9fa !important; border: 1px solid #000 !important; } thead { background: #f8f9fa !important; border-bottom: 1px solid #000 !important; } .total-row { background: #f0f0f0 !important; border-top: 1px solid #000 !important; } table { font-size: 10px; } th { padding: 6px 4px; } td { padding: 5px 4px; } }
                </style>
            </head>
            <body>
                <div class="purchase-container">
                    <div class="purchase-header">
                        <div class="company-info"><div class="company-name">Mi Empresa</div><div class="company-details">Dirección: Calle Principal 123<br>Tel: (123) 456-7890 | Email: info@miempresa.com</div></div>
                        <div class="purchase-title">Detalle de Compra</div>
                        <div class="purchase-number">#${selectedPurchase.id}</div>
                        <div class="generated-date">Impreso el ${currentDate}</div>
                    </div>
                    <div class="purchase-body">
                        <div class="info-section"><div class="info-grid"><div><div class="info-item"><div class="info-label">Proveedor:</div><div class="info-value">${selectedPurchase.supplier}</div></div><div class="info-item"><div class="info-label">Número de Factura:</div><div class="info-value">${selectedPurchase.factura}</div></div></div><div><div class="info-item"><div class="info-label">Fecha de Compra:</div><div class="info-value">${purchaseDate}</div></div><div class="info-item"><div class="info-label">Total de Productos:</div><div class="info-value">${selectedPurchaseDetails.length} items</div></div></div></div></div>
                        <div class="total-highlight"><div style="margin-bottom: 10px; font-size: 16px;">Total de la Compra</div><div class="total-amount">${formatCurrency(selectedPurchase.cost)}</div></div>
                        <h3 style="color: #6c757d; border-bottom: 2px solid #6c757d; padding-bottom: 10px; margin-bottom: 20px;">Detalle de Productos</h3>
                        <div class="table-container"><table><thead><tr><th class="text-left">Producto</th><th class="text-left">Descripción</th><th class="text-center">Cantidad</th><th class="text-right">Costo Unitario</th><th class="text-right">Total</th></tr></thead><tbody>
            `;

            selectedPurchaseDetails.forEach((detail) => {
                htmlContent += `<tr><td class="text-left">${detail.producto}</td><td class="text-left">${detail.description}</td><td class="text-center">${formatQuantity(detail.cantidad)}</td><td class="text-right">${detail.precio}</td><td class="text-right">${detail.total}</td></tr>`;
            });

            htmlContent += `<tr class="total-row"><td colspan="4" class="text-right"><strong>TOTAL GENERAL:</strong></td><td class="text-right"><strong>${formatCurrency(selectedPurchase.cost)}</strong></td></tr></tbody></table></div></div>
                <div class="purchase-footer"><div class="footer-info">Este documento es un comprobante de compra generado el ${currentDate}<br>Para consultas o reclamos sobre esta compra, conserve este documento<br>Factura N° ${selectedPurchase.factura} | Proveedor: ${selectedPurchase.supplier}</div></div>
            </div>
            </body>
            </html>`;

            iframe.onload = () => {
                try {
                    iframe.contentWindow.focus();
                    iframe.contentWindow.print();
                } catch (error) {
                    console.error('Error al intentar imprimir:', error);
                    mostrarError('No se pudo abrir el diálogo de impresión.', theme);
                } finally {
                    setTimeout(() => {
                        if (iframe.parentNode) {
                            iframe.parentNode.removeChild(iframe);
                        }
                    }, 1000);
                }
            };

            const printDocument = iframe.contentDocument || iframe.contentWindow.document;
            printDocument.open();
            printDocument.write(htmlContent);
            printDocument.close();

        } catch (error) {
            console.error("Error al generar el reporte de compra para imprimir:", error);
            mostrarError('No se pudo generar el reporte de compra. Por favor, intente de nuevo.', theme);
        }
    };

    const kilogramoUnitId = useMemo(() => {
        return unitsData?.find(unit => unit.name === 'Kilogramo')?.id;
    }, [unitsData]);

    const isPesableProduct = useMemo(() => {
        return selectedProduct && selectedProduct.units_id === kilogramoUnitId && selectedProduct.tipo_venta === 'pesable';
    }, [selectedProduct, kilogramoUnitId]);

    // --- Mutaciones ---
    const { mutateAsync: newPurchase, isLoading: isSaving } = useSubmit('newPurchase');
    const { mutateAsync: updatePurchase, isLoading: isUpdating } = useSubmit('updatePurchase');
    const { mutateAsync: deletePurchase, isLoading: isDeleting } = useDelete('deletePurchase');

    // --- Efectos ---
    useEffect(() => {
        if (purchasesData) {
            setTotalRows(purchasesData.pagination?.total || 0);
        }
    }, [purchasesData]);

    useEffect(() => {
        if (isPesableProduct) {
            const totalPerUnits = parseFloat(itemValues.quantity || 0);
            const costPerUnits = (parseFloat(itemValues.cost || 0) / (totalPerUnits || 1));
            setItemValues(prevValues => ({
                ...prevValues,
                totalPerUnits: totalPerUnits,
                costPerUnits: isFinite(costPerUnits) ? costPerUnits.toFixed(3) : 0
            }));
        } else if (Object.hasOwn(itemValues, 'boxes') || Object.hasOwn(itemValues, 'unitsPerBox') || Object.hasOwn(itemValues, 'quantityPerUnits') || Object.hasOwn(itemValues, 'cost')) {
            const totalPerUnits = (parseFloat(itemValues.boxes || 0) || 1) * (parseFloat(itemValues.unitsPerBox || 0) || 1) * (parseFloat(itemValues.quantityPerUnits || 0) || 1);
            const costPerUnits = (parseFloat(itemValues.cost || 0) / (totalPerUnits || 1));
            setItemValues(prevValues => ({
                ...prevValues,
                totalPerUnits: totalPerUnits,
                costPerUnits: isFinite(costPerUnits) ? costPerUnits.toFixed(3) : 0
            }));
        }
    }, [itemValues.boxes, itemValues.unitsPerBox, itemValues.quantityPerUnits, itemValues.cost, itemValues.quantity, isPesableProduct]);


    // --- Handlers de UI ---
    const handleOpenPurchaseModal = (purchase = null) => {
        if (purchase) {
            setIsEditingPurchase(true);
            // Formatear createdAt a YYYY-MM-DD para el formulario (input type="date")
            setPurchaseValues({
                ...purchase,
                createdAt: moment.utc(purchase.createdAt).format('YYYY-MM-DD')
            });
            setTempItems(purchase.details.map(detail => {
                const product = detail.stock; // The backend now sends the necessary stock info
                const isDetailPesable = product && kilogramoUnitId && product.units_id === kilogramoUnitId && product.tipo_venta === 'pesable';

                return {
                    stock_id: detail.stock_id,
                    name: product.name,
                    description: product.description,
                    units_id: product.units_id, // Store necessary fields
                    tipo_venta: product.tipo_venta, // Store necessary fields
                    cost: detail.cost * detail.quantity, // Costo total del item
                    costPerUnits: detail.cost, // Costo por unidad
                    ...(isDetailPesable ? {
                        quantity: parseFloat(detail.quantity),
                        totalPerUnits: parseFloat(detail.quantity)
                    } : {
                        boxes: 1,
                        unitsPerBox: 1,
                        quantityPerUnits: detail.quantity,
                        totalPerUnits: detail.quantity
                    })
                };
            }) || []);
        } else {
            setIsEditingPurchase(false);
            setPurchaseValues({ createdAt: moment().format('YYYY-MM-DD') });
            resetItemForm();
            setTempItems([]);
            setEditingItemIndex(null);
            setSelectedProduct(null);
        }
        setModalError('');
        setPurchaseModalOpen(true);
    };

    const handleClosePurchaseModal = useCallback(() => {
        setPurchaseModalOpen(false);
        setBarcodeInput(''); // Clear barcode input on modal close
    }, []);

    const handleShowDetails = (purchase) => {
        setSelectedPurchase(purchase);
        const formattedDetails = purchase.details.map(detail => ({
            id: detail.id,
            producto: detail.stock.name,
            description: detail.stock.description,
            cantidad: detail.quantity,
            precio: formatCurrency(detail.cost),
            total: formatCurrency(detail.cost * detail.quantity),
        }));
        setSelectedPurchaseDetails(formattedDetails);
        setDetailsModalOpen(true);
    };

    const handleDeletePurchase = (purchase) => {
        confirmAction(async () => {
            try {
                await deletePurchase({ url: '/delPurchase', id: purchase.id });
                mostrarExito('Compra eliminada con éxito!', theme);
                refetchPurchases();
            } catch (error) {
                mostrarError(error.response?.data?.message || 'Hubo un error al eliminar la compra.', theme);
            }
        }, () => { }, '¿Estás seguro de eliminar esta compra?', theme); // Pasar onDenied como función vacía y el mensaje
    };

    const handleBarcodeSearch = useCallback(async (barcode) => {
        if (!barcode) {
            setSelectedProduct(null);
            handleItemInputChange({ target: { name: 'stock_id', value: '' } });
            setModalError('');
            return;
        }

        if (validator.isEmpty(barcode)) {
            setModalError('Por favor, ingrese un código de barras.');
            setSelectedProduct(null);
            handleItemInputChange({ target: { name: 'stock_id', value: '' } });
            return;
        }

        try {
            const { data: product } = await Api.get(`/stock/barcode/${barcode}`);

            if (product) {
                setSelectedProduct(product);
                handleItemInputChange({ target: { name: 'stock_id', value: product.id } });
                handleItemInputChange({ target: { name: 'name', value: product.name } }); // Pre-fill name
                handleItemInputChange({ target: { name: 'description', value: product.description } }); // Pre-fill description

                // For non-pesable products, pre-fill quantity and cost if available
                if (product.tipo_venta !== 'pesable') {
                    handleItemInputChange({ target: { name: 'quantityPerUnits', value: 1 } }); // Default to 1 unit
                } else {
                    // For pesable products, clear quantity fields and focus on quantity input
                    handleItemInputChange({ target: { name: 'quantity', value: '' } });
                    handleItemInputChange({ target: { name: 'cost', value: '' } });
                }
                setModalError('');
                setProductSearchTerm(product.name); // Update search term to ensure product is in options
                // Focus on the quantity input field (assuming it exists and is correctly referenced)
                if (quantityInputRef.current) {
                    quantityInputRef.current.focus();
                }
            } else {
                setModalError('Producto no encontrado con este código de barras. Por favor, agregue el producto en el módulo de Stock.');
                setSelectedProduct(null);
                handleItemInputChange({ target: { name: 'stock_id', value: '' } });
            }
        } catch (error) {
            console.error('Error al buscar producto por código de barras:', error);
            setModalError('Error al buscar producto: ' + (error.response?.data?.message || 'Error desconocido'));
            setSelectedProduct(null);
            handleItemInputChange({ target: { name: 'stock_id', value: '' } });
        }
    }, [barcodeInput, handleItemInputChange, quantityInputRef]); // Added barcodeInput to dependencies

    const debouncedSearchRef = useRef(debounce((barcode) => handleBarcodeSearch(barcode), 750));

    const handleBarcodeInputChange = useCallback((e) => {
        const newBarcode = e.target.value;
        setBarcodeInput(newBarcode);
        debouncedSearchRef.current(newBarcode); // Call the debounced function from useRef
    }, [debouncedSearchRef]);

    const handleBarcodeKeyDown = useCallback((e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            debouncedSearchRef.current.cancel(); // Cancel any pending debounced calls
            handleBarcodeSearch(e.target.value); // Use e.target.value for immediate search
        }
    }, [handleBarcodeSearch, debouncedSearchRef]);

    // --- Handlers para Items del Modal ---
    const handleAddItem = () => {
        // Crear una copia de los valores para poder modificarlos
        let processedItemValues = { ...itemValues };

        if (!isPesableProduct) {
            // Si los campos están vacíos o son 0, establecerlos a 1 por defecto.
            if (!processedItemValues.boxes || parseFloat(processedItemValues.boxes) <= 0) {
                processedItemValues.boxes = 1;
            }
            if (!processedItemValues.unitsPerBox || parseFloat(processedItemValues.unitsPerBox) <= 0) {
                processedItemValues.unitsPerBox = 1;
            }
        }

        let isValid = false;
        if (isPesableProduct) {
            const { quantity, cost } = processedItemValues;
            isValid = selectedProduct && validator.isNumeric((quantity || '').toString()) && quantity > 0 && validator.isNumeric((cost || '').toString()) && cost > 0;
        } else {
            const { boxes, unitsPerBox, quantityPerUnits, cost } = processedItemValues;
            isValid = selectedProduct && validator.isNumeric((boxes || '').toString()) && boxes > 0 && validator.isNumeric((unitsPerBox || '').toString()) && unitsPerBox > 0 && validator.isNumeric((quantityPerUnits || '').toString()) && quantityPerUnits > 0 && validator.isNumeric((cost || '').toString()) && cost > 0;
        }

        if (!isValid) {
            setModalError('Por favor, comprueba los campos del item. Producto, Cant/Unidad y Costo son requeridos y deben ser mayores a 0.');
            return;
        }

        // Calcular el costo total del item antes de añadirlo
        processedItemValues.cost = processedItemValues.totalPerUnits * parseFloat(processedItemValues.costPerUnits || 0);

        // Usar los valores procesados para crear el nuevo item
        const newItem = { ...processedItemValues, name: selectedProduct.name, description: selectedProduct.description };

        if (editingItemIndex !== null) {
            const updatedItems = [...tempItems];
            updatedItems[editingItemIndex] = newItem;
            setTempItems(updatedItems);
            setEditingItemIndex(null);
        } else {
            setTempItems([...tempItems, newItem]);
        }
        resetItemForm();
        setSelectedProduct(null);
        setModalError('');
        setBarcodeInput(''); // Clear barcode input after adding item
    };

    const handleEditItem = (index) => {
        const item = tempItems[index];
        setEditingItemIndex(index);
        setItemValues(item);

        // Re-construct the product object from the item itself,
        // which now contains all necessary info.
        const product = {
            id: item.stock_id,
            name: item.name,
            description: item.description,
            units_id: item.units_id,
            tipo_venta: item.tipo_venta
        };
        setSelectedProduct(product);
    };

    const handleDeleteItem = (index) => {
        setTempItems(tempItems.filter((_, i) => i !== index));
    };

    const handleSavePurchase = async () => {
        if (tempItems.length === 0) {
            setModalError('Debes agregar al menos un item a la compra.');
            return;
        }

        const { createdAt, factura, supplier } = purchaseValues;
        if (!createdAt || !factura || !supplier) {
            setModalError('Completa los campos Fecha, Factura y Proveedor.');
            return;
        }

        // Validación de la fecha
        const purchaseDate = moment(createdAt, 'YYYY-MM-DD', true); // Volver a YYYY-MM-DD
        if (!purchaseDate.isValid() || purchaseDate.year() < 2000) {
            setModalError('La fecha de la factura no es válida. Por favor, usa el formato AAAA-MM-DD y un año razonable.'); // Actualizar mensaje
            return;
        }
        if (purchaseDate.isAfter(moment())) {
            setModalError('La fecha de la factura no puede ser en el futuro.');
            return;
        }

        mostrarCarga('Guardando Compra...', theme);

        const purchaseData = {
            ...purchaseValues,
            cost: totalCost,
            tempValues: tempItems.map(item => ({
                stock_id: item.stock_id,
                totalPerUnits: item.totalPerUnits,
                costPerUnits: parseFloat(item.costPerUnits)
            }))
        };

        try {
            if (isEditingPurchase) {
                await updatePurchase({ url: `/purchases/${purchaseValues.id}`, values: purchaseData, method: 'put', showSuccessAlert: false });
            } else {
                await newPurchase({ url: '/purchases/full', values: purchaseData, showSuccessAlert: false });
            }

            await refetchPurchases();
            await reStock();

            Swal.close();
            mostrarExito('Compra guardada con éxito!', theme);

            resetPurchaseForm();
            resetItemForm();
            setTempItems([]);
            setEditingItemIndex(null);
            setSelectedProduct(null);
            setModalError('');
            handleClosePurchaseModal();

        } catch (error) {
            Swal.close();
            console.error('handleSavePurchase: Caught an error!', error);
            setModalError(error.response?.data?.message || 'Hubo un error al guardar la compra.');
        }
    };

    // --- Columnas y formato ---
    const allColumns = useMemo(() => [
        { id: 'createdAt', label: 'Fecha', align: 'center', valueGetter: ({ row }) => moment.utc(row.createdAt).format('DD/MM/YYYY') },
        { id: 'factura', label: 'Factura', align: 'center' },
        { id: 'supplier', label: 'Proveedor', align: 'center' },
        { id: 'cost', label: 'Total', align: 'center', valueGetter: ({ row }) => formatCurrency(row.cost) },
        {
            id: 'actions', label: 'Acciones', align: 'center', valueGetter: ({ row }) => (
                <>
                    <Tooltip title='Ver Detalle'>
                        <IconButton size='small' color='secondary' onClick={() => handleShowDetails(row)}>
                            <AddchartIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Editar Compra'>
                        <IconButton size='small' color='info' onClick={() => handleOpenPurchaseModal(row)}>
                            <EditIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Eliminar Compra'>
                        <IconButton size='small' color='warning' onClick={() => handleDeletePurchase(row)}>
                            <DeleteForeverIcon fontSize='small' />
                        </IconButton>
                    </Tooltip>
                </>
            )
        },
    ], []);

    const itemsColumns = [
        { id: 'name', label: 'Producto', align: 'center' },
        { id: 'totalPerUnits', label: 'Cantidad', align: 'center', valueGetter: ({ row }) => formatQuantity(row.totalPerUnits) },
        { id: 'cost', label: 'Costo Total', align: 'center', valueGetter: ({ row }) => formatCurrency(row.cost) },
        { id: 'actions', label: 'Acciones', align: 'center' },
    ];

    const detailColumns = [
        { id: 'producto', label: 'Producto', align: 'left' },
        { id: 'description', label: 'Descripción', align: 'left' },
        { id: 'cantidad', label: 'Cantidad', align: 'center' },
        { id: 'precio', label: 'Costo Unitario', align: 'right' },
        { id: 'total', label: 'Total', align: 'right' },
    ];

    const visibleColumns = useMemo(() => allColumns.filter(col => columnVisibility[col.id]), [allColumns, columnVisibility]);

    const formatCurrency = (value) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        return num.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    };

    const formatQuantity = (value, decimals = 2) => {
        const num = parseFloat(value);
        if (isNaN(num)) return '';
        return num.toFixed(decimals);
    };

    const handlePageChange = (event, newPage) => setPage(newPage);
    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isLoading = isLoadingPurchases || isLoadingSuppliers || isLoadingStock;

    const isInitialLoading = !purchasesData && isLoadingPurchases;

    if (isInitialLoading) {
        return <PurchasesManagerSkeleton />;
    }

    return (
        <Box sx={{ p: 1 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 3, mt: 2, background: (theme) => theme.palette.background.componentHeaderBackground, color: theme.palette.primary.contrastText }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid>
                        <Typography variant="h4" gutterBottom>Gestión de Compras</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>Administra las compras de tu negocio</Typography>
                    </Grid>
                    <Grid>
                        <StyledButton variant="outlined" onClick={() => handleOpenPurchaseModal()} startIcon={<SaveAsIcon />}>
                            Nueva Compra
                        </StyledButton>
                    </Grid>
                </Grid>
            </Paper>

            <StyledCard sx={{ p: 2, mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="h6">Filtros de Búsqueda</Typography>
                    <IconButton disableRipple size="small" onClick={() => setOpenFilterSection(!openFilterSection)} sx={{ p: 0 }}>
                        <KeyboardArrowDown sx={{ transition: '0.5s', transform: openFilterSection ? 'rotate(-180deg)' : 'rotate(0)', backgroundColor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%' }} />
                    </IconButton>
                </Grid>
                <Box sx={{ height: openFilterSection ? 'auto' : 0, overflow: 'hidden', transition: 'height 0.3s ease-in-out' }}>
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <Grid container spacing={2} justifyContent="center" alignItems="flex-start">
                            <Grid xs={12}>
                                <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 2, height: '100%', backgroundColor: theme.palette.background.paper }}>
                                    <Typography variant="subtitle1" gutterBottom>Filtrar Tabla</Typography>
                                    <Grid container spacing={2}>
                                        <Grid xs={12} sm={6} md={3}><StyledTextField label="Nº de Factura" name="factura" value={facturaInput} onChange={(e) => setFacturaInput(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => setFacturaInput('')}><ClearIcon color='error' /></IconButton></InputAdornment> }} /></Grid>
                                        <Grid xs={12} sm={6} md={3}><StyledTextField label="Proveedor" name="supplier" value={supplierInput} onChange={(e) => setSupplierInput(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><IconButton onClick={() => setSupplierInput('')}><ClearIcon color='error' /></IconButton></InputAdornment> }} /></Grid>
                                        <Grid xs={12} sm={6} md={3}><StyledDatePicker
                                            label="Fecha Inicio"
                                            value={filters.startDate ? moment(filters.startDate) : null}
                                            onChange={(newValue) => {
                                                handleFilterChange({ target: { name: 'startDate', value: newValue ? newValue.format('YYYY-MM-DD') : '' } });
                                                setPage(0);
                                            }}
                                            format="DD/MM/YYYY"
                                            slotProps={{
                                                textField: {
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <IconButton size='small' onClick={() => {
                                                                    handleFilterChange({ target: { name: 'startDate', value: '' } });
                                                                    setPage(0);
                                                                }}>
                                                                    <ClearIcon fontSize='small' color='error' />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }
                                            }}
                                        /></Grid>
                                        <Grid xs={12} sm={6} md={3}><StyledDatePicker
                                            label="Fecha Fin"
                                            value={filters.endDate ? moment(filters.endDate) : null}
                                            onChange={(newValue) => {
                                                handleFilterChange({ target: { name: 'endDate', value: newValue ? newValue.format('YYYY-MM-DD') : '' } });
                                                setPage(0);
                                            }}
                                            format="DD/MM/YYYY"
                                            slotProps={{
                                                textField: {
                                                    InputProps: {
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <IconButton size='small' onClick={() => {
                                                                    handleFilterChange({ target: { name: 'endDate', value: '' } });
                                                                    setPage(0);
                                                                }}>
                                                                    <ClearIcon fontSize='small' color='error' />
                                                                </IconButton>
                                                            </InputAdornment>
                                                        )
                                                    }
                                                }
                                            }}
                                        /></Grid>
                                        <Grid xs={12} sm={6} md={4}><StyledAutocomplete
                                            options={products || []}
                                            getOptionLabel={(option) => (typeof option === 'string' ? option : option?.name || '')}
                                            getOptionKey={(option) => option.id}
                                            isOptionEqualToValue={(option, value) => option?.id === value?.id} onChange={(event, value) => { handleFilterChange({ target: { name: 'stock_id', value: value ? value.id : '' } }); setPage(0); }}
                                            onInputChange={(event, newInputValue) => {
                                                debouncedSetProductSearchTerm(newInputValue);
                                            }}
                                            loading={isLoadingStock}
                                            filterOptions={(x) => x}
                                            value={products.find(p => p.id === filters.stock_id) || null}
                                            renderInput={(params) => (<StyledTextField {...params} label="Filtrar por producto contenido" InputProps={{ ...params.InputProps, startAdornment: <InputAdornment position="start"><IconButton onClick={() => handleFilterChange({ target: { name: 'stock_id', value: '' } })}><ClearIcon color='error' /></IconButton></InputAdornment>, endAdornment: (<>{isLoadingStock ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</>) }} />)}
                                        /></Grid>
                                        <Grid xs={12} sm={6} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><StyledButton variant="outlined" color="secondary" onClick={() => { resetFilters(); setPage(0); }}>Limpiar Filtros</StyledButton></Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        </Grid>
                    </LocalizationProvider>
                </Box>
            </StyledCard>

            <StyledCard sx={{ p: 2 }}>
                <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Grid><Typography variant="h6" gutterBottom>Listado de Compras</Typography></Grid>
                    <Grid><StyledButton aria-controls="columns-menu" aria-haspopup="true" onClick={(event) => setAnchorEl(event.currentTarget)} variant="outlined">Mostrar/Ocultar Columnas</StyledButton><Menu id="columns-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>{allColumns.map((column) => (column.id !== 'actions' && (<MenuItem key={column.id}><FormControlLabel control={<Checkbox checked={!!columnVisibility[column.id]} onChange={(event) => { setColumnVisibility({ ...columnVisibility, [column.id]: event.target.checked, }); }} />} label={column.label} /></MenuItem>)))}</Menu></Grid>
                </Grid>
                <EnhancedTable columns={visibleColumns} data={purchasesData?.rows || []} loading={isLoading} count={totalRows} page={page} rowsPerPage={rowsPerPage} onPageChange={handlePageChange} onRowsPerPageChange={handleRowsPerPageChange} />
            </StyledCard>

            <StyledDialog open={purchaseModalOpen} onClose={handleClosePurchaseModal} maxWidth="xl" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                    {isEditingPurchase ? 'Editar Compra' : 'Nueva Compra'}
                    <IconButton onClick={handleClosePurchaseModal}><CloseIcon color="error" /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, backgroundColor: 'background.paper' }}>
                    <Box sx={{ backgroundColor: 'background.dialog', p: 3 }}>
                        {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}
                        <Grid container spacing={2} sx={{ mt: 0 }} justifyContent="center">
                            <Grid xs={12} md={4}>
                                <LocalizationProvider dateAdapter={AdapterMoment}>
                                    <StyledDatePicker
                                        label="Fecha"
                                        value={purchaseValues.createdAt ? moment(purchaseValues.createdAt) : null}
                                        onChange={(newValue) => {
                                            handlePurchaseInputChange({ target: { name: 'createdAt', value: newValue ? newValue.format('YYYY-MM-DD') : '' } });
                                        }}
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                InputProps: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <IconButton size='small' onClick={() => handlePurchaseInputChange({ target: { name: 'createdAt', value: '' } })}>
                                                                <ClearIcon fontSize='small' color='error' />
                                                            </IconButton>
                                                        </InputAdornment>
                                                    )
                                                }
                                            }
                                        }}
                                    />
                                </LocalizationProvider>
                            </Grid>
                            <Grid xs={12} md={4}>
                                <TextFieldWithClear
                                    fullWidth
                                    label="Nº de Factura"
                                    name="factura"
                                    value={purchaseValues.factura || ''}
                                    onChange={handlePurchaseInputChange}
                                    onClear={() => handlePurchaseInputChange({ target: { name: 'factura', value: '' } })}
                                />
                            </Grid>
                            <Grid xs={12} md={4}>
                                <StyledAutocomplete
                                    freeSolo
                                    options={suppliersData || []}
                                    getOptionLabel={(option) => {
                                        if (typeof option === 'string') {
                                            return option;
                                        }
                                        if (option.inputValue) {
                                            return option.nombre;
                                        }
                                        return option.nombre || '';
                                    }}
                                    value={suppliersData?.find(s => s.nombre === purchaseValues.supplier) || null}
                                    onChange={(event, newValue) => {
                                        if (typeof newValue === 'string') {
                                            setNewSupplierName(newValue);
                                            setOpenNewSupplierModal(true);
                                        } else if (newValue && newValue.inputValue) {
                                            setNewSupplierName(newValue.inputValue);
                                            setOpenNewSupplierModal(true);
                                        } else {
                                            handlePurchaseInputChange({ target: { name: 'supplier', value: newValue?.nombre || '' } });
                                        }
                                    }}
                                    filterOptions={(options, params) => {
                                        const filtered = createFilterOptions({
                                            stringify: option => option.nombre,
                                        })(options, params);

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
                                    renderInput={(params) => <TextFieldWithClear {...params} label="Proveedor" onClear={() => handlePurchaseInputChange({ target: { name: 'supplier', value: '' } })} />}
                                    renderOption={(props, option) => {
                                        const { key, ...rest } = props;
                                        return <li key={key} {...rest}>{option.nombre}</li>;
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Divider sx={{ my: 3 }}>Añadir Items</Divider>
                        <Grid container spacing={2} justifyContent="center">
                            <Grid xs={12} md={6} lg={4}>
                                <TextFieldWithClear
                                    fullWidth
                                    label="Código de Barras"
                                    type="text"
                                    name="barcode"
                                    value={barcodeInput}
                                    onChange={handleBarcodeInputChange}
                                    onKeyDown={handleBarcodeKeyDown}
                                    onClear={() => {
                                        setBarcodeInput('');
                                        setSelectedProduct(null);
                                        resetItemForm();
                                        setModalError('');
                                        // Explicitly call handleBarcodeSearch with an empty string
                                        // to trigger the reset logic in the search function.
                                        handleBarcodeSearch('');
                                    }}
                                    inputRef={barcodeInputRef}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={4}>
                                <StyledAutocomplete
                                    options={products || []}
                                    value={selectedProduct}
                                    onChange={(e, newValue) => {
                                        setSelectedProduct(newValue);
                                        handleItemInputChange({ target: { name: 'stock_id', value: newValue?.id || '' } });
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        debouncedSetProductSearchTerm(newInputValue);
                                    }}
                                    getOptionLabel={(option) => option.name || ""}
                                    getOptionKey={(option) => option.id}
                                    isOptionEqualToValue={(option, value) => option.id === value.id}
                                    loading={isLoadingStock}
                                    filterOptions={(x) => x}
                                    renderInput={(params) => <TextFieldWithClear {...params} label="Selecciona un producto" onClear={() => setSelectedProduct(null)} InputProps={{...params.InputProps, endAdornment: (<>{isLoadingStock ? <CircularProgress size={20} /> : null}{params.InputProps.endAdornment}</>)}} />}
                                />
                            </Grid>
                            {isPesableProduct ? (
                                <Grid xs={6} md={3} lg={2}>
                                    <TextFieldWithClear
                                        fullWidth
                                        label="Cantidad (Kg)"
                                        type='number'
                                        name='quantity'
                                        value={itemValues.quantity || ''}
                                        onChange={handleItemInputChange}
                                        onClear={() => handleItemInputChange({ target: { name: 'quantity', value: '' } })}
                                        inputRef={quantityInputRef}
                                    />
                                </Grid>
                            ) : (
                                <>
                                    <Grid xs={6} md={3} lg={2}>
                                        <TextFieldWithClear
                                            fullWidth
                                            label="Cajas/Bultos"
                                            type='number'
                                            name='boxes'
                                            value={itemValues.boxes || ''}
                                            onChange={handleItemInputChange}
                                            onClear={() => handleItemInputChange({ target: { name: 'boxes', value: '' } })}
                                        />
                                    </Grid>
                                    <Grid xs={6} md={3} lg={2}>
                                        <TextFieldWithClear
                                            fullWidth
                                            label="Unidades/Caja"
                                            type='number'
                                            name='unitsPerBox'
                                            value={itemValues.unitsPerBox || ''}
                                            onChange={handleItemInputChange}
                                            onClear={() => handleItemInputChange({ target: { name: 'unitsPerBox', value: '' } })}
                                        />
                                    </Grid>
                                    <Grid xs={6} md={3} lg={2}>
                                        <TextFieldWithClear
                                            fullWidth
                                            label="Cant/Unidad"
                                            type='number'
                                            name='quantityPerUnits'
                                            value={itemValues.quantityPerUnits || ''}
                                            onChange={handleItemInputChange}
                                            onClear={() => handleItemInputChange({ target: { name: 'quantityPerUnits', value: '' } })}
                                            inputRef={quantityInputRef}
                                        />
                                    </Grid>
                                </>
                            )}
                            <Grid xs={6} md={3} lg={2}>
                                <TextFieldWithClear
                                    fullWidth
                                    label="Costo Total"
                                    type='number'
                                    name='cost'
                                    value={itemValues.cost || ''}
                                    onChange={handleItemInputChange}
                                    onClear={() => handleItemInputChange({ target: { name: 'cost', value: '' } })}
                                />
                            </Grid>
                            <Grid xs={6} md={3} lg={2}><StyledTextField fullWidth label="Total Unidades" type='number' name='totalPerUnits' value={itemValues.totalPerUnits || 0} InputProps={{ readOnly: true }} /></Grid>
                            <Grid xs={6} md={3} lg={2}><StyledTextField fullWidth label="Costo/Unidad" type='text' name='costPerUnits' value={formatCurrency(itemValues.costPerUnits) || ''} InputProps={{ readOnly: true }} /></Grid>
                            <Grid xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}><StyledButton fullWidth variant="outlined" onClick={handleAddItem} startIcon={<PlaylistAddIcon />}>{editingItemIndex !== null ? 'Actualizar' : 'Agregar'}</StyledButton></Grid>
                        </Grid>
                        {tempItems.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <EnhancedTable
                                    columns={itemsColumns}
                                    data={tempItems}
                                    loading={false}
                                    pagination={false}
                                    renderRow={(row, index) => (
                                        <tr key={index}>
                                            <td align="center">{row.name}</td>
                                            <td align="center">{row.totalPerUnits}</td>
                                            <td align="center">{formatCurrency(row.cost)}</td>
                                            <td align="center">
                                                <Tooltip title="Editar Item"><IconButton size='small' color='info' onClick={() => handleEditItem(index)}><EditIcon fontSize='small' /></IconButton></Tooltip>
                                                <Tooltip title="Eliminar Item"><IconButton size='small' color='warning' onClick={() => handleDeleteItem(index)}><DeleteForeverIcon fontSize='small' /></IconButton></Tooltip>
                                            </td>
                                        </tr>
                                    )}
                                />
                                <Typography variant="h6" align="right" sx={{ mt: 2 }}>Total Compra: {formatCurrency(totalCost)}</Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                    <StyledButton variant="contained" color="primary" onClick={handleSavePurchase} disabled={isSaving || isUpdating}>{isSaving || isUpdating ? <CircularProgress size={24} /> : 'Guardar Compra'}</StyledButton>
                    <StyledButton variant="outlined" color="secondary" onClick={handleClosePurchaseModal} sx={{ padding: '2px 12px', ml: 2 }}>Cancelar</StyledButton>
                </DialogActions>
            </StyledDialog>

            <StyledDialog open={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}>
                    Detalle de la Compra #{selectedPurchase?.id}
                    <IconButton onClick={() => setDetailsModalOpen(false)}>
                        <CloseIcon color="error" />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ backgroundColor: 'background.dialog' }}>
                    {selectedPurchase && (
                        <Box sx={{ pt: 2 }}>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid xs={12} sm={6}>
                                    <Typography><strong>Proveedor:</strong> {selectedPurchase.supplier}</Typography>
                                    <Typography><strong>Factura Nº:</strong> {selectedPurchase.factura}</Typography>
                                </Grid>
                                <Grid xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                                    <Typography><strong>Fecha:</strong> {moment.utc(selectedPurchase.createdAt).format('DD/MM/YYYY')}</Typography>
                                    <Typography variant="h6" component="p" sx={{ fontWeight: 'bold', mt: 1 }}>
                                        TOTAL: {formatCurrency(selectedPurchase.cost)}
                                    </Typography>
                                </Grid>
                            </Grid>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>Productos</Typography>
                            <EnhancedTable
                                columns={detailColumns}
                                data={selectedPurchaseDetails}
                                pagination={false}
                                loading={false}
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                    <StyledButton variant="outlined" onClick={() => setDetailsModalOpen(false)}>Cerrar</StyledButton>
                    <StyledButton variant="contained" startIcon={<PrintIcon />} onClick={handlePrintPurchase}>Imprimir</StyledButton>
                </DialogActions>
            </StyledDialog>
            <NewSupplierModal open={openNewSupplierModal} handleClose={() => setOpenNewSupplierModal(false)} initialName={newSupplierName} onSupplierAdded={(newSupplier) => { refetchSuppliers(); setPurchaseValues(prev => ({ ...prev, supplier: newSupplier.nombre })); }} />
            {/* <NewProductModal open={openNewProductModal} handleClose={() => setOpenNewProductModal(false)} initialName={newProductName} onProductAdded={(newProduct) => { refetchStock(); setSelectedProduct(newProduct); setItemValues(prev => ({ ...prev, stock_id: newProduct.id })); }} /> */}
        </Box>
    );
};

export default PurchasesManager;