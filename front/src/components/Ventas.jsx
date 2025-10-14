import { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import validator from 'validator';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import ClearIcon from '@mui/icons-material/Clear';
import { IconButton, InputAdornment, Tooltip, CircularProgress, Box, Paper, Alert, Chip } from '@mui/material';
import { StyledButton } from '../styledComponents/ui/StyledButton';
import { StyledTextField } from '../styledComponents/ui/StyledTextField';
import { StyledAutocomplete } from '../styledComponents/ui/StyledAutocomplete';
import { motion } from "framer-motion"
import EditIcon from '@mui/icons-material/Edit';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import LockClockIcon from '@mui/icons-material/LockClock';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { useTheme } from '@mui/material/styles'; // Importar useTheme

import { useForm } from '../hooks/useForm';
import { UseFetchQuery, UseQueryWithCache } from '../hooks/useQuery';
import { useSubmit } from '../hooks/useSubmit';
import { useDelete } from '../hooks/useDelete';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useCashRegister } from '../hooks/useCashRegister'; // Importar useCashRegister
import { confirmAction } from '../functions/ConfirmDelete';
import { debounce } from '../functions/Debounce';
import { EnhancedTable } from '../styledComponents/EnhancedTable';
import { variants } from '../styles/variants';
import { mostrarError } from '../functions/MostrarError';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarInfo } from '../functions/mostrarInfo';
import { mostrarConfirmacion } from '../functions/mostrarConfirmacion';
import { mostrarInput } from '../functions/mostrarInput'; // <-- AÑADIDO
import { mostrarCarga } from '../functions/mostrarCarga';
import { Api } from '../api/api'; // Importar la instancia de axios
import { syncService } from '../services/syncService'; // Importar el servicio de sincronización

import { AuthContext } from '../context/AuthContext';
import { CajaManager } from '../styledComponents/CajaManager';
import PesableProductModal from '../styledComponents/PesableProductModal';
import PendingTicketsModal from '../styledComponents/PendingTicketsModal';
import SummarySaleModal from '../styledComponents/SummarySaleModal';
import ManualEntryModal from '../styledComponents/ManualEntryModal';
import { ProductPresentationModal } from '../styledComponents/ProductPresentationModal';
import { applyPromotions } from '../functions/salesLogic';
import VentasSkeleton from '../styledComponents/skeletons/VentasSkeleton';

/**
 * Calcula los totales, recargos y saldos para una venta con pagos mixtos,
 * utilizando una lógica de cálculo directo para los recargos.
 * El monto ingresado por el usuario es la base sobre la cual se calcula el recargo.
 */
const calcularTotalConRecargoDirecto = (subtotal, mixedPayments, paymentMethods) => {
  let totalPagadoAlSubtotal = 0;
  let totalRecargos = 0;
  const surchargeDetails = [];
  const paymentBreakdown = [];

  for (const payment of mixedPayments) {
    const method = paymentMethods.find(pm => pm.id === payment.payment_method_id);
    const baseAmount = parseFloat(payment.amount) || 0; // El monto ingresado es el monto base

    if (!method || baseAmount <= 0) continue;

    let surchargeAmount = 0;
    let amountWithSurcharge = baseAmount;

    if (method.surcharge_active && method.surcharge_percentage > 0) {
      const surchargeRate = parseFloat(method.surcharge_percentage) / 100;
      surchargeAmount = baseAmount * surchargeRate;
      amountWithSurcharge = baseAmount + surchargeAmount;
    }

    totalPagadoAlSubtotal += baseAmount;
    totalRecargos += surchargeAmount;

    surchargeDetails.push({
      methodName: method.method || method.nombre,
      amountEntered: baseAmount, // El monto que ingresó el usuario
      baseAmount: baseAmount,
      surchargeAmount: surchargeAmount,
      percentage: method.surcharge_percentage || 0,
    });

    paymentBreakdown.push({
      ...payment,
      methodName: method.method || method.nombre,
      baseAmount: baseAmount,
      surchargeAmount: surchargeAmount,
      finalAmount: amountWithSurcharge // El monto final a cobrar para este método
    });
  }

  const saldoPendiente = subtotal - totalPagadoAlSubtotal;
  const totalFinal = subtotal + totalRecargos;

  return {
    subtotal,
    totalRecargos,
    surchargeDetails,
    totalPagadoAlSubtotal,
    saldoPendiente,
    totalFinal,
    paymentBreakdown,
    isPaid: Math.abs(saldoPendiente) < 0.01,
    isOverpaid: saldoPendiente < -0.01
  };
};

const Ventas = () => {

  const theme = useTheme(); // Inicializar el hook useTheme
  //const screenSize = { width: window.innerWidth };

  const { usuario } = useContext(AuthContext);

  // Hook para verificar la sesión de caja activa
  const {
    activeSessionData,
    isSessionActive,
    isCheckingSession,
    refetchActiveSession: refetchSession, // Renombrar para mantener la compatibilidad
    isSessionError // Mantener para el useEffect si es necesario, aunque useCashRegister debería manejarlo
  } = useCashRegister(usuario?.id);

  console.log('[Ventas] sessionData:', activeSessionData); // Ahora es activeSessionData
  console.log('[Ventas] isSessionActive:', isSessionActive);
  console.log('[Ventas] activeSessionData:', activeSessionData);

  const [isCajaModalOpen, setIsCajaModalOpen] = useState(false);

  const handleOpenCajaModal = () => {
    setIsCajaModalOpen(true);
  };

  const handleCloseCajaModal = () => {
    setIsCajaModalOpen(false);
    refetchSession(); // Refrescar el estado de la sesión con el hook
  };

  useEffect(() => {
    if (isSessionError) {
      mostrarError('No se pudo verificar el estado de la caja. Intente recargar la página.', theme);
    }
  }, [isSessionError]);


  // Estados
  const [tempTable, setTempTable] = useState(() => {
    const storedData = localStorage.getItem('tempTable');
    return storedData ? JSON.parse(storedData) : [];
  });
  const [isPresentationModalOpen, setIsPresentationModalOpen] = useState(false);
  const [productWithPresentations, setProductWithPresentations] = useState(null);
  const [isManualEntryMode, setIsManualEntryMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [values, handleValuesChange, resetValues, resetValuesArray, setValues] = useForm({});
  const [totalCost, setTotalCost] = useState(0);
  // MODIFIED: paymentType -> selectedSinglePaymentType
  const [selectedSinglePaymentType, setSelectedSinglePaymentType] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState({ id: 1, name: "Consumidor Final" });
  const [ivaActivo, setIvaActivo] = useState(false);
  const [descuento, setDescuento] = useState(0);
  const [tempQuantity, setTempQuantity] = useState('');
  const [isQuantityMode, setIsQuantityMode] = useState(false);
  const [showManualEntryModal, setShowManualEntryModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [customQuantityMode, setCustomQuantityMode] = useState(false);
  const [customQuantity, setCustomQuantity] = useState('');
  const [currentTicketId, setCurrentTicketId] = useState(null);
  const [showPendingTickets, setShowPendingTickets] = useState(false);
  const [pendingTicketsModalMode, setPendingTicketsModalMode] = useState('full'); // 'full' or 'infoOnly'
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState('');
  const [summaryError, setSummaryError] = useState(''); // <-- Nuevo estado para el error del modal
  const [saleCompletedId, setSaleCompletedId] = useState(null); // <--- Nuevo estado para el ID de la venta completada


  const [paymentOption, setPaymentOption] = useState('single'); // 'single' or 'mixed'
  const [mixedPayments, setMixedPayments] = useState([
    { payment_method_id: null, amount: '' },
    { payment_method_id: null, amount: '' }
  ]);

  // Estados para el modal de productos pesables
  const [isPesableModalOpen, setIsPesableModalOpen] = useState(false);
  const [productToWeigh, setProductToWeigh] = useState(null);
  const [weight, setWeight] = useState('');
  const [pendingQuantity, setPendingQuantity] = useState(null);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isScanningBarcode, setIsScanningBarcode] = useState(false);

  const handlePresentationModalClose = useCallback(() => {
    setIsPresentationModalOpen(false);
    setProductWithPresentations(null);
    setPendingQuantity(null);
    setCustomQuantityMode(false);
    setCustomQuantity('');
    setTimeout(() => inputRefCodigoBarra.current?.focus(), 100);
  }, []);



  // Referencias
  const inputRefCodigoBarra = useRef(null);
  const autocompleteInputRef = useRef(null);
  const amountReceivedInputRef = useRef(null);
  const weightInputRef = useRef(null); // Nueva referencia para el campo de peso
  const manualProductNameRef = useRef(null); // Referencia para el campo de nombre en el modal manual
  const confirmSaleButtonRef = useRef(null); // <-- Nueva referencia para el botón de confirmar venta

  // Hooks
  const { data: stockData, refetch: reStock, isLoading: stockLoading } = UseFetchQuery(
    ['stock', productSearchTerm], // La clave de la query incluye el término de búsqueda
    `/stock?limit=100&name=${productSearchTerm}`,
    !!usuario,
    0,
    { keepPreviousData: true } // Opcional: mantiene los datos anteriores mientras se cargan los nuevos
  );
  const stock = stockData || { products: [] }; // Asegurarse de que stock nunca sea undefined

  const { data: categories, isLoading: categoriesLoading } = UseQueryWithCache('categories', `/category`, !!usuario, 0, { staleTime: 1000 * 60 * 60 });
  const { data: units, isLoading: unitsLoading } = UseQueryWithCache('units', '/units', !!usuario, 0, { staleTime: 1000 * 60 * 60 });
  const { data: paymentMethods, isLoading: paymentLoading } = UseQueryWithCache('payment', '/payment', !!usuario, 0, { staleTime: 0 });
  const { data: customers, isLoading: customersLoading } = UseQueryWithCache('customers', '/customers', !!usuario, 0, { staleTime: 1000 * 60 * 60 });
  const { data: pendingTickets = [], refetch: refetchPendingTickets, isLoading: pendingTicketsLoading } = UseQueryWithCache('pendingTickets', '/pending-tickets');
  const { data: promotions, isLoading: promotionsLoading } = UseQueryWithCache('promotions', '/promotions?is_active=true',);
  const { data: combos, isLoading: combosLoading } = UseQueryWithCache('combos', '/combos?is_active=true');
  const { isOnline } = useOnlineStatus(); // <--- AÑADIR HOOK DE ESTADO DE CONEXIÓN

  const [formValues, handleInputChange, reset, resetArray, setFormValues] = useForm()
  const [isSavingSale, setIsSavingSale] = useState(false); // <--- REEMPLAZAR loadingSale
  const { mutateAsync: createPendingTicket, isLoading: isCreatingTicket } = useSubmit();
  const { mutateAsync: deleteItem, isLoading: isDeletingTicket } = useDelete();

  const processedTempTable = useMemo(() => applyPromotions(tempTable, promotions), [tempTable, promotions]);

  // Función centralizada para limpiar el estado de la venta
  const clearSaleState = useCallback(() => {
    setTempTable([]);
    setValues({});
    setSelectedProduct(null);
    setCurrentTicketId(null);
    const efectivo = paymentMethods?.find(method =>
      method.method?.toLowerCase().includes('efectivo') ||
      method.nombre?.toLowerCase().includes('efectivo')
    );
    setSelectedSinglePaymentType(efectivo || null);
    setPaymentOption('single');
    setMixedPayments([
      { payment_method_id: null, amount: '' },
      { payment_method_id: null, amount: '' }
    ]);
    setSelectedCustomer({ id: 1, name: "Consumidor Final" });
    setDescuento(0);
    setIvaActivo(false);
    localStorage.removeItem('tempTable');
    setAmountReceived('');
    inputRefCodigoBarra.current?.focus();
  }, [paymentMethods, setValues]); // Dependencias necesarias para la función

  // Nueva función para cancelar la edición de un ticket pendiente
  const handleCancelEdit = () => {
    mostrarConfirmacion(
      {
        title: '¿Cancelar Edición?',
        text: 'Se descartarán los cambios y se limpiará la venta actual.',
        confirmButtonText: 'Sí, descartar'
      },
      theme,
      () => { // onConfirm
        clearSaleState();
      }
    );
  };

  const calcularTotal = useCallback(() => {
    let subtotal = 0;
    processedTempTable.forEach(item => {
      subtotal += parseFloat(item.cost || 0);
    });

    const descuentoAplicado = descuento || 0;
    const subtotalConDescuento = subtotal - descuentoAplicado;

    let surchargeAmount = 0;
    let surchargeDetails = [];
    let saldoPendiente = 0;

    if (paymentOption === 'single' && selectedSinglePaymentType?.surcharge_active) {
      surchargeAmount = subtotalConDescuento * (parseFloat(selectedSinglePaymentType.surcharge_percentage) / 100);
    } else if (paymentOption === 'mixed' && paymentMethods) {
      const result = calcularTotalConRecargoDirecto(subtotalConDescuento, mixedPayments, paymentMethods);
      surchargeAmount = result.totalRecargos;
      surchargeDetails = result.surchargeDetails;
      saldoPendiente = result.saldoPendiente;
    }

    const impuesto = ivaActivo ? (subtotalConDescuento + surchargeAmount) * 0.21 : 0;
    const totalFinal = subtotalConDescuento + surchargeAmount + impuesto;

    return {
      subtotal,
      impuesto,
      descuento: descuentoAplicado,
      surchargeAmount,
      surchargeDetails, // <-- Importante devolver esto
      saldoPendiente,   // <-- Importante devolver esto
      totalFinal
    };
  }, [processedTempTable, ivaActivo, descuento, selectedSinglePaymentType, paymentOption, mixedPayments, paymentMethods]);

  const { subtotal, impuesto, descuento: descuentoAplicado, surchargeAmount, surchargeDetails, saldoPendiente, totalFinal } = useMemo(() => calcularTotal(), [calcularTotal]);

  const validateMixedPayments = useCallback(() => {
    const validPayments = mixedPayments.filter(p => p.payment_method_id && parseFloat(p.amount) > 0);
    if (validPayments.length === 0) {
      return 'Ingrese al menos un monto para el pago mixto.';
    }

    const subtotalConDescuento = (subtotal || 0) - (descuento || 0);
    const result = calcularTotalConRecargoDirecto(subtotalConDescuento, mixedPayments, paymentMethods);

    if (result.isOverpaid) {
      return `Se ha excedido el monto del subtotal en ${Math.abs(result.saldoPendiente).toFixed(2)}. Ajuste los montos.`;
    }

    if (result.saldoPendiente > 0.01) {
      return `Faltan ${result.saldoPendiente.toFixed(2)} para completar el pago.`;
    }

    const methodIds = validPayments.map(p => p.payment_method_id);
    if (new Set(methodIds).size !== methodIds.length) {
      return 'Los métodos de pago no pueden ser iguales.';
    }

    const hasCredito = validPayments.some(p => {
      const method = paymentMethods?.find(pm => pm.id === p.payment_method_id);
      return method?.method?.toLowerCase().includes('credito') || method?.nombre?.toLowerCase().includes('credito');
    });

    if (hasCredito && selectedCustomer.id === 1) {
      return 'No se puede otorgar crédito al Consumidor Final.';
    }

    return true;
  }, [mixedPayments, subtotal, descuento, paymentMethods, selectedCustomer]);

  const handleSaveSale = async () => {
    const ticketIdToDelete = currentTicketId;

    if (tempTable.length === 0) {
      mostrarError('No hay productos en la venta');
      return;
    }

    // Validaciones existentes...
    if (paymentOption === 'single' && (selectedSinglePaymentType?.method?.toLowerCase().includes('credito') || selectedSinglePaymentType?.nombre?.toLowerCase().includes('credito')) && selectedCustomer.id === 1) {
      setSummaryError('No se puede otorgar crédito al Consumidor Final. Por favor, seleccione otro cliente.');
      return;
    }

    let paymentsToSend = [];
    if (paymentOption === 'single') {
      // Lógica para pago simple
      if (selectedSinglePaymentType) {
        let amount = 0;
        const paymentMethodName = (selectedSinglePaymentType.method || selectedSinglePaymentType.nombre || '').toLowerCase();
        if (paymentMethodName.includes('credito') || paymentMethodName.includes('crédito') || paymentMethodName.includes('cuenta corriente')) {
          amount = totalFinal; // Para crédito, el monto es el total de la venta
        } else {
          amount = totalFinal; // Para otros métodos de pago (ej. efectivo), el monto registrado es el total de la venta, no el monto recibido.
        }
        paymentsToSend.push({
          payment_method_id: selectedSinglePaymentType.id,
          amount: amount
        });
      }
    } else { // mixed payment
      // Lógica para pago mixto
      paymentsToSend = mixedPayments
        .filter(p => p.payment_method_id && parseFloat(p.amount) > 0)
        .map(p => ({
          payment_method_id: p.payment_method_id,
          amount: parseFloat(p.amount)
        }));
    }

    setIsSavingSale(true);
    try {
      const userId = usuario?.id;
      if (!userId) {
        mostrarError('No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.', theme);
        return;
      }

      const saleData = {
        total_amount: subtotal,
        promotion_discount: descuentoAplicado,
        surcharge_amount: surchargeAmount,
        total_neto: totalFinal,
        customer_id: selectedCustomer.id,
        user_id: userId,
        payments: paymentsToSend,
        tempValues: processedTempTable.map(item => ({
          id: item.id,
          stock_id: item.stock_id,
          presentation_id: item.presentation_id || null,
          promotion_id: item.promotion?.id || null,
          quantity: item.quantity_for_stock_deduction || item.quantity,
          price: item.price,
          final_price: item.cost,
          force_sale: item.force_sale || false,
          is_manual_entry: item.is_manual_entry || false,
          type: item.type
        }))
      };

      // *** LLAMADA AL NUEVO SERVICIO DE SINCRONIZACIÓN ***
      const response = await syncService.saveSale(saleData, isOnline);

      if (response.success) {
        if (ticketIdToDelete) {
          try {
            await deleteItem({ url: '/pending-tickets', id: ticketIdToDelete });
            refetchPendingTickets();
          } catch (deleteError) {
            console.error("Error al eliminar el ticket pendiente después de la venta:", deleteError);
            mostrarError('La venta se completó, pero no se pudo eliminar el ticket pendiente.', theme);
          }
        }

        clearSaleState();
        setIsSummaryModalOpen(false);

        if (isOnline) {
          reStock(); // Refrescar stock solo si estamos online
        }

        if (response.synced) {
          setSaleCompletedId(response.server_id || response.id);
        } else {
          mostrarInfo('Venta guardada localmente. Se sincronizará al recuperar la conexión.', theme);
          // Opcional: podrías querer un ID local para mostrar
          setSaleCompletedId(response.localId);
        }

      } else {
        mostrarError('Error al guardar la venta: La operación local falló.', theme);
      }
    } catch (error) {
      console.error('Error al guardar la venta:', error);
      mostrarError('Error al guardar la venta: ' + (error.message || 'Error desconocido'), theme);
      inputRefCodigoBarra.current?.focus();
    } finally {
      setIsSavingSale(false);
    }
  };

  // Función para guardar ticket pendiente
  const handleSavePendingTicket = async (fromSummaryModal = false) => {
    if (tempTable.length === 0) {
      mostrarError('No hay productos en la venta', theme);
      return;
    }

    if (!activeSessionData || !activeSessionData.id) {
      mostrarError('No se pudo identificar la sesión de caja activa. Asegúrese de haber iniciado una sesión de caja antes de guardar un ticket.', theme);
      return;
    }

    // 1. Close the modal to avoid focus trap (only if it was open)
    if (fromSummaryModal) {
      setIsSummaryModalOpen(false);
    }

    try {
      // 2. Get user input
      const result = await mostrarInput({
        title: 'Guardar Ticket Pendiente',
        inputLabel: 'Por favor, ingrese un nombre para el ticket pendiente (ej: Pedido de Ana):',
        inputValidator: (value) => {
          if (!value) {
            return '¡Necesitas escribir algo!';
          }
        }
      }, theme);

      // 3. Process the result
      if (result.isConfirmed && result.value) {
        // 3a. Show loading indicator
        mostrarCarga('Guardando Ticket', theme);

        const ticketName = result.value;
        const { subtotal, impuesto, descuento: descuentoAplicado, totalFinal } = calcularTotal();

        const ticket_data = {
          tempTable: [...tempTable],
          customer: selectedCustomer,
          paymentType: selectedSinglePaymentType,
          paymentOption,
          mixedPayments,
          subtotal,
          impuesto,
          descuento: descuentoAplicado,
          totalFinal,
          ivaActivo,
        };

        const dataToSend = {
          name: ticketName.trim(),
          ticket_data,
          user_id: usuario?.id,
          cash_session_id: activeSessionData?.id,
        };

        // 3b. Perform async action
        await createPendingTicket({
          url: '/pending-tickets',
          values: dataToSend,
          showSuccessAlert: true,
          successMessage: 'Ticket guardado correctamente'
        });

        // 3c. Clean up state on success
        clearSaleState();
        refetchPendingTickets();

      } else {
        // 4. If user cancelled, conditionally re-open the summary modal
        if (fromSummaryModal) {
          setIsSummaryModalOpen(true);
        }
        await mostrarInfo('Operación cancelada.', theme); // Await the promise
        inputRefCodigoBarra.current?.focus(); // Then set focus
      }
    } catch (error) {
      // 5. On error, conditionally re-open the summary modal
      if (fromSummaryModal) {
        setIsSummaryModalOpen(true);
      }
      console.error('Error al guardar ticket pendiente:', error);
      // The useSubmit hook will show the error alert, but we still need to handle UI state
    }
  };


  // Guardar el array en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('tempTable', JSON.stringify(tempTable));
    // Recalcular el total cada vez que tempTable cambie
    setTotalCost(calcularTotal().totalFinal);
  }, [tempTable]);

  useEffect(() => {
    const applyCombosAndSetTable = () => {
      if (!combos || combos.length === 0 || !tempTable) {
        return;
      }

      let newItems = JSON.parse(JSON.stringify(tempTable));
      let comboApplied;
      let changesMade = false;

      do {
        comboApplied = false;
        for (const combo of combos) {
          const productItemsInCart = newItems.filter(item => item.type === 'product' || !item.type);
          const itemCounts = productItemsInCart.reduce((acc, item) => {
            acc[item.stock_id] = (acc[item.stock_id] || 0) + item.quantity;
            return acc;
          }, {});

          const canMakeCombo = combo.combo_items.every(
            (comboItem) => (itemCounts[comboItem.stock_id] || 0) >= comboItem.quantity
          );

          if (canMakeCombo) {
            changesMade = true;
            comboApplied = true;

            // Remove ingredients
            for (const comboItem of combo.combo_items) {
              let quantityToDeduct = comboItem.quantity;
              newItems = newItems.map(cartItem => {
                if ((cartItem.type === 'product' || !cartItem.type) && cartItem.stock_id === comboItem.stock_id && quantityToDeduct > 0) {
                  const deduction = Math.min(cartItem.quantity, quantityToDeduct);
                  cartItem.quantity -= deduction;
                  cartItem.cost = cartItem.quantity * parseFloat(cartItem.price);
                  quantityToDeduct -= deduction;
                }
                return cartItem;
              }).filter(cartItem => cartItem.quantity > 0);
            }

            // Add combo
            const existingCombo = newItems.find(item => item.type === 'combo' && item.id === combo.id);
            if (existingCombo) {
              existingCombo.quantity += 1;
              existingCombo.cost = existingCombo.quantity * parseFloat(combo.price);
            } else {
              newItems.unshift({
                temp_id: Date.now() + Math.random(),
                id: combo.id,
                name: combo.name,
                price: combo.price,
                quantity: 1,
                cost: parseFloat(combo.price),
                type: 'combo',
                description: combo.combo_items.map(ci => {
                  const num = parseFloat(ci.quantity);
                  const formattedQty = num % 1 === 0 ? num : num.toFixed(3);
                  return `${formattedQty}x ${ci.stock.name}`;
                }).join(', '),
              });
            }
            break; // Restart scan
          }
        }
      } while (comboApplied);

      if (changesMade) {
        setTempTable(currentTable => {
          if (JSON.stringify(currentTable) !== JSON.stringify(newItems)) {
            return newItems;
          }
          return currentTable;
        });
      }
    };

    const timer = setTimeout(() => {
      applyCombosAndSetTable();
    }, 500);

    return () => clearTimeout(timer);

  }, [tempTable, combos]);

  const isConfirmButtonDisabled = useCallback(() => {
    if (isSavingSale || tempTable.length === 0) {
      return true;
    }

    if (paymentOption === 'single') {
      if (!selectedSinglePaymentType) {
        return true; // Si no hay método de pago, deshabilitado
      }

      const paymentMethodName = (selectedSinglePaymentType.method || selectedSinglePaymentType.nombre || '').toLowerCase();

      // Si es crédito, la validación del cliente se hará al hacer clic.
      // Aquí, el botón debe estar habilitado.
      if (paymentMethodName.includes('credito')) {
        return false;
      }

      // Para los demás pagos (efectivo, etc.), el monto recibido debe ser suficiente
      return amountReceived === '' || parseFloat(amountReceived) < totalFinal;

    } else { // Pago Mixto
      return validateMixedPayments() !== true;
    }
  }, [
    isSavingSale,
    tempTable.length,
    paymentOption,
    selectedSinglePaymentType,
    amountReceived,
    totalFinal,
    validateMixedPayments
  ]);

  // Efecto para atajos de teclado globales (versión 7 - keydown con preventDefault inmediato)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.key) return;
      const key = e.key.toLowerCase();

      // IMPORTANTE: Capturar Alt+M ANTES de que el navegador lo procese
      if (e.altKey && key === 'm') {
        // Prevenir COMPLETAMENTE el comportamiento por defecto del navegador
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Solo procesar si estamos en el modal de resumen
        if (isSummaryModalOpen) {
          setPendingTicketsModalMode('infoOnly');
          setShowPendingTickets(true);
        }

        // Retornar false para asegurar que no se propague
        return false; // Para compatibilidad con algunos navegadores/eventos
      }

      // Atajos que solo funcionan cuando el modal de resumen está abierto
      if (isSummaryModalOpen) {
        if (e.altKey && key === 'v') {
          e.preventDefault();
          // Simular un clic en el botón de confirmar venta
          if (confirmSaleButtonRef.current) {
            confirmSaleButtonRef.current.click();
          }
          return;
        }
        if (e.altKey && key === 'p') {
          e.preventDefault();
          handleSavePendingTicket();
          return;
        }
        if (e.altKey && key === 'c') {
          e.preventDefault();
          setIsSummaryModalOpen(false);
          setTimeout(() => {
            confirmAction(() => {
              setTempTable([]);
              setValues({});
              setSelectedProduct(null);
              setCurrentTicketId(null);
              const efectivo = paymentMethods?.find(method =>
                method.method?.toLowerCase().includes('efectivo') ||
                method.nombre?.toLowerCase().includes('efectivo')
              );
              setSelectedSinglePaymentType(efectivo || null);
              setPaymentOption('single');
              setMixedPayments([
                { payment_method_id: null, amount: '' },
                { payment_method_id: null, amount: '' }
              ]);
              setSelectedCustomer({ id: 1, name: "Consumidor Final" });
              setDescuento(0);
              setIvaActivo(false);
              localStorage.removeItem('tempTable');
              setAmountReceived('');
              inputRefCodigoBarra.current?.focus();
            }, () => {
              setIsSummaryModalOpen(true);
            }, theme);
          }, 300);
          return;
        }
        if (e.altKey && key === 't') {
          e.preventDefault();
          setPendingTicketsModalMode('infoOnly');
          setShowPendingTickets(true);
          return;
        }
      }

      // Atajos globales (no se ejecutan si hay otros modales abiertos)
      const isAnyModalOpen = isCajaModalOpen || showManualEntryModal || showPendingTickets || isPesableModalOpen || isSummaryModalOpen || isPresentationModalOpen;

      if (e.altKey && key === 'f') {
        e.preventDefault();
        if (tempTable.length > 0) {
          setIsSummaryModalOpen(true);
        } else {
          mostrarError('No hay productos en la venta para finalizar.', theme);
        }
        return;
      }

      // NEW GLOBAL Alt+P
      if (e.altKey && key === 'p') {
        e.preventDefault();
        if (tempTable.length > 0) {
          handleSavePendingTicket(false); // Pass false as it's not from SummarySaleModal
        } else {
          mostrarError('No hay productos en la venta para guardar como ticket pendiente.', theme);
        }
        return;
      }

      // El resto de atajos globales solo se activan si no hay NINGÚN modal abierto
      if (!isAnyModalOpen) {
        if (e.altKey && key === 'b') {
          e.preventDefault();
          autocompleteInputRef.current?.focus();
        }
        if (e.altKey && key === 'x') {
          e.preventDefault();
          setShowManualEntryModal(true);
          setFormValues({});
          setSelectedProduct(null);
        }
        if (e.altKey && key === 'c') {
          e.preventDefault();
          setCustomQuantityMode(true);
          setCustomQuantity('');
          setValues(prev => ({ ...prev, barcode: '' }));
          inputRefCodigoBarra.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, {
      capture: true,
      passive: false
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown, {
        capture: true,
        passive: false
      });
    };
  }, [
    tempTable, isCajaModalOpen, showManualEntryModal, showPendingTickets,
    isPesableModalOpen, isSummaryModalOpen, isPresentationModalOpen, handleSaveSale, handleSavePendingTicket,
    totalFinal, paymentMethods, selectedCustomer, isConfirmButtonDisabled
  ]);

  useEffect(() => {
    if (isPesableModalOpen) {
      const timer = setTimeout(() => {
        weightInputRef.current?.focus();
      }, 100); // Pequeño delay para asegurar que el modal esté completamente renderizado
      return () => clearTimeout(timer);
    }
  }, [isPesableModalOpen]);

  // Efecto para manejar el monto recibido según el método de pago
  useEffect(() => {
    if (isSummaryModalOpen && paymentOption === 'single') {
      const paymentMethodName = (selectedSinglePaymentType?.method || selectedSinglePaymentType?.nombre || '').toLowerCase();

      if (paymentMethodName.includes('credito')) {
        setAmountReceived('0'); // Establecer a 0 para crédito, ya que no se recibe monto
      } else if (paymentMethodName.includes('efectivo')) {
        setAmountReceived(''); // Limpiar para efectivo, el usuario ingresará el monto
        // Enfocar el input después de un pequeño retraso para asegurar que esté renderizado y habilitado
        const timer = setTimeout(() => {
          if (amountReceivedInputRef.current) {
            amountReceivedInputRef.current.focus();
          }
        }, 100);
        return () => clearTimeout(timer);
      } else if (selectedSinglePaymentType) { // Otros métodos de pago (Tarjeta, MP, etc.)
        setAmountReceived(totalFinal.toFixed(2)); // Autocompletar con el total
      }
    }
  }, [selectedSinglePaymentType, totalFinal, isSummaryModalOpen, paymentOption]);

  // Efecto para autofocus en el campo de nombre del producto en el modal manual
  useEffect(() => {
    if (showManualEntryModal) {
      const timer = setTimeout(() => {
        manualProductNameRef.current?.focus();
      }, 100); // Pequeño delay para asegurar que el modal esté completamente renderizado
      return () => clearTimeout(timer);
    }
  }, [showManualEntryModal]);

  // Efecto para enfocar el campo de código de barras después de cerrar el modal de tickets pendientes
  useEffect(() => {
    if (!showPendingTickets && inputRefCodigoBarra.current) {
      inputRefCodigoBarra.current.focus();
    }
  }, [showPendingTickets]);

  // Set default payment method to "Efectivo" when payment methods are loaded
  useEffect(() => {
    if (paymentMethods && Array.isArray(paymentMethods) && paymentMethods.length > 0 && !selectedSinglePaymentType && paymentOption === 'single') {
      const efectivo = paymentMethods.find(method =>
        method.method?.toLowerCase().includes('efectivo') ||
        method.nombre?.toLowerCase().includes('efectivo')
      );
      if (efectivo) {
        setSelectedSinglePaymentType(efectivo);
      }
    }
  }, [paymentMethods]);

  // Efecto para mostrar la alerta de éxito DESPUÉS de que el modal se haya cerrado
  useEffect(() => {
    if (saleCompletedId) {
      mostrarExito(`Venta #${saleCompletedId} registrada correctamente`, theme).then(() => {
        // Pequeño retraso para asegurar que Swal haya terminado su animación de cierre
        // y liberado el control del foco antes de que intentemos moverlo.
        setTimeout(() => {
          inputRefCodigoBarra.current?.focus();
        }, 100);
        setSaleCompletedId(null); // Resetear el estado para futuras ventas
      });
    }
  }, [saleCompletedId]);

  // Efecto para validar la combinación de pago y cliente en tiempo real
  useEffect(() => {
    if (isSummaryModalOpen && paymentOption === 'single') {
      const paymentMethodName = (selectedSinglePaymentType?.method || selectedSinglePaymentType?.nombre || '').toLowerCase();
      if (paymentMethodName.includes('credito') && selectedCustomer?.id === 1) {
        setSummaryError('No se puede otorgar crédito al Consumidor Final. Por favor, seleccione un cliente válido.');
      } else {
        setSummaryError(''); // Limpiar error si la combinación es válida
      }
    } else {
      setSummaryError(''); // Limpiar error si el modal está cerrado o es pago mixto
    }
  }, [isSummaryModalOpen, paymentOption, selectedSinglePaymentType, selectedCustomer]);

  const deletingItemTempTable = (temp_id) => {
    const setFocus = () => {
      setTimeout(() => {
        if (!isSummaryModalOpen) {
          inputRefCodigoBarra.current?.focus();
        }
      }, 100);
    };

    const onConfirm = () => {
      setTempTable(prevTable => prevTable.filter((item) => item.temp_id !== temp_id));
      setCurrentTicketId(null);
      setFocus();
    };

    const onCancel = () => {
      setFocus();
    };

    confirmAction(onConfirm, onCancel, '¿Estás seguro?', theme);
  };

  const setValuesForm = (item) => {
    // Determine if the item is a presentation
    const isPresentation = item.presentation_id !== undefined && item.presentation_id !== null;

    let displayPrice = item.price;
    let displayQuantity = item.quantity; // Changed from quantityPerUnits

    if (isPresentation) {
      // For presentations, item.price is the total price of the presentation
      // item.quantity is the quantity_in_base_units
      // So, price per base unit = item.price / item.quantity
      displayPrice = item.price / item.quantity; // Price per base unit
    }

    setFormValues({
      stock_id: item.stock_id,
      name: item.name,
      description: item.description,
      price: displayPrice, // This will be price per base unit for presentations
      quantity: displayQuantity, // This will be quantity_in_base_units for presentations
      category_id: item.category_id,
      units_id: item.units_id,
      cost: item.cost // This is the total cost of the item (presentation price or base product total)
    });
  };

  const editItemTempTable = (temp_id) => {
    const item = tempTable.find(i => i.temp_id === temp_id);
    if (!item) return;

    // If the item is a real product from stock, find it in the main list
    // and set it as the Autocomplete's value to prevent errors.
    if (item.stock_id) {
      const productFromStock = stock?.products?.find(p => p.id === item.stock_id);
      setSelectedProduct(productFromStock || null);
    } else {
      // If it's a manual entry, there's nothing to select in the Autocomplete.
      setSelectedProduct(null);
    }

    const index = tempTable.findIndex(i => i.temp_id === temp_id);

    setValuesForm(item);
    setEditingItem(item);
    setEditingIndex(index);
    setShowManualEntryModal(true);
    // DO NOT remove the item from the table anymore.
  };

  const agregar = () => {
    const { stock_id, quantityPerUnits, price, name, description } = values;

    const itemToAdd = {
      stock_id: stock_id || null,
      quantityPerUnits: parseFloat(quantityPerUnits) || 1,
      price: parseFloat(price) || 0,
      name: name || 'Producto',
      description: description || 'Descripción',
      cost: (parseFloat(quantityPerUnits) || 1) * (parseFloat(price) || 0),
    };

    setTempTable(prevTable => [...prevTable, itemToAdd]);
    setValues({});
    setSelectedProduct(null);
    setIsManualEntryMode(false);
    setCustomQuantityMode(false);
    setCustomQuantity('');

    // Return focus to barcode field
    setTimeout(() => {
      if (!isSummaryModalOpen) {
        inputRefCodigoBarra.current?.focus();
      }
    }, 100);
  };

  const finalizeManualEntry = (itemToFinalize, forceSale = false) => {
    setTempTable(prevTable => {
      let newTable;
      if (editingItem && editingIndex !== null) {
        // If editing, insert at the original position
        newTable = [...prevTable];
        newTable.splice(editingIndex, 1, { ...itemToFinalize, force_sale: forceSale });
      } else {
        // If adding new, prepend to the start
        newTable = [{ ...itemToFinalize, force_sale: forceSale }, ...prevTable];
      }
      return newTable;
    });

    // Reset editing state
    setEditingItem(null);
    setEditingIndex(null);
    setFormValues({});
    setSelectedProduct(null);
    setShowManualEntryModal(false);
    setCustomQuantityMode(false);
    setCustomQuantity('');
    setIsManualEntryMode(false); // Asegurar que el modo manual se desactive al agregar

    setValues(prev => ({ ...prev, barcode: '' })); // Limpiar el campo de código de barras

    // Volver el foco al campo de código de barras
    setTimeout(() => {
      inputRefCodigoBarra.current?.focus();
    }, 100);
  };

  const handleManualEntrySubmit = () => {
    const { quantityPerUnits, price, name, description, category_id, units_id, stock_id } = formValues;
    // Validaciones básicas
    if (!name || !price || !quantityPerUnits) {
      mostrarError('Por favor complete los campos obligatorios: Nombre, Precio y Cantidad', theme);
      return;
    }

    let itemToAdd = {
      temp_id: editingItem?.temp_id || Date.now() + Math.random(),
      stock_id: stock_id || null,
      presentation_id: editingItem?.presentation_id || null,
      quantity: parseFloat(quantityPerUnits) || 1, // This is the display quantity (number of presentations or base units)
      name: name.trim(),
      description: description?.trim() || (editingItem ? editingItem.description : 'Producto manual'),
      category_id: category_id || null,
      units_id: units_id || null,
      is_manual_entry: !stock_id,
    };

    const isPresentation = itemToAdd.presentation_id !== undefined && itemToAdd.presentation_id !== null;

    if (isPresentation) {
      // For presentations, 'price' from the form is the price of one presentation.
      itemToAdd.price = parseFloat(price) || 0; // Price of one presentation
      itemToAdd.cost = itemToAdd.quantity * itemToAdd.price; // Total cost for X presentations
      // Calculate quantity for stock deduction based on the original presentation's base units
      const originalPresentation = stock?.products?.find(p => p.id === itemToAdd.stock_id)
        ?.presentations?.find(pres => pres.id === itemToAdd.presentation_id);
      if (originalPresentation) {
        itemToAdd.quantity_for_stock_deduction = itemToAdd.quantity * originalPresentation.quantity_in_base_units;
      } else {
        // Fallback if original presentation not found (shouldn't happen if data is consistent)
        itemToAdd.quantity_for_stock_deduction = itemToAdd.quantity;
      }
    } else {
      // For base products, 'price' from the form is unit price.
      itemToAdd.price = parseFloat(price) || 0; // Unit price
      itemToAdd.cost = itemToAdd.quantity * itemToAdd.price; // Total cost
      itemToAdd.quantity_for_stock_deduction = itemToAdd.quantity; // Same as display quantity
    }

    if (itemToAdd.stock_id) {
      const stockItem = stock?.products?.find(s => s.id === itemToAdd.stock_id);
      const availableStock = stockItem ? stockItem.stock : 0;

      if (availableStock < itemToAdd.quantity_for_stock_deduction) { // Use quantity_for_stock_deduction here
        // Ocultar el modal de entrada manual antes de mostrar la confirmación
        setShowManualEntryModal(false);

        setTimeout(() => {
          mostrarConfirmacion({
            title: 'Stock Insuficiente',
            html: `
              <p>Producto: <strong>${itemToAdd.name}</strong></p>
              <p>Cantidad Solicitada: <strong>${itemToAdd.quantity_for_stock_deduction}</strong></p>
              <br/>
              <p>¿Desea continuar la venta y dejar el stock en negativo?</p>
            `,
            stockInfo: availableStock, // Pasar la información de stock por separado
            icon: 'warning',
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'No, cancelar'
          }, theme, () => {
            // Forzar venta
            finalizeManualEntry(itemToAdd, true);
          }, () => {
            // Si se deniega, restaurar el ítem original si se estaba editando

            // Volver a mostrar el modal de entrada manual
            setShowManualEntryModal(true);
            setFormValues(editingItem); // Restaurar los valores del formulario
            setValues(prev => ({ ...prev, barcode: '' }));
            setTimeout(() => { inputRefCodigoBarra.current?.focus(); }, 100);
          });
        }, 300); // Pequeño retraso para asegurar que el modal se oculte completamente
      } else {
        finalizeManualEntry(itemToAdd, false);
      }
    } else {
      finalizeManualEntry(itemToAdd, false);
    }
  };

  const handleCloseManualEntryModal = () => {
    // When canceling an edit, we no longer need to modify the tempTable
    // because the original item was never removed.

    // Reset all states related to manual entry/editing
    setShowManualEntryModal(false);
    setFormValues({});
    setSelectedProduct(null);
    setEditingItem(null);
    setEditingIndex(null);
    setIsManualEntryMode(false); // Asegurar que el modo manual se desactive
    setValues(prev => ({ ...prev, barcode: '' })); // Limpiar el campo de código de barras principal

    // Volver el foco al campo de código de barras
    setTimeout(() => {
      inputRefCodigoBarra.current?.focus();
    }, 100);
  };



  // Función para cargar ticket pendiente
  const handleLoadPendingTicket = (ticket) => {
    // El ticket ahora viene de la DB, los datos están en `ticket_data`
    const data = ticket.ticket_data;

    setTempTable(data.tempTable);
    setSelectedCustomer(data.customer);
    setSelectedSinglePaymentType(data.paymentType);
    setPaymentOption(data.paymentOption || 'single');
    setMixedPayments(data.mixedPayments || [{ payment_method_id: null, amount: '' }, { payment_method_id: null, amount: '' }]);
    setIvaActivo(data.ivaActivo);
    setDescuento(data.descuento);
    setCurrentTicketId(ticket.id); // El ID es el del registro en la DB
    setShowPendingTickets(false);

    // Guardar en localStorage para persistencia local mientras se edita
    localStorage.setItem('tempTable', JSON.stringify(data.tempTable));
  };

  // Función para eliminar ticket pendiente
  const handleDeletePendingTicket = (ticketId) => {
    mostrarConfirmacion(
      {
        title: '¿Estás seguro?',
        text: '¿Quieres eliminar este ticket pendiente?'
      },
      theme,
      async () => { // onConfirm
        setShowPendingTickets(false);
        mostrarCarga('Eliminando Ticket...', theme);

        try {
          // The useDelete hook will show the success alert on its own.
          await deleteItem({ url: `/pending-tickets/${ticketId}` });

          if (currentTicketId === ticketId) {
            // If we were editing this ticket, clear the sale state
            clearSaleState();
          }

          refetchPendingTickets(); // Refresh the list in the background
        } catch (error) {
          // Error is handled by useDelete's onError callback
          console.error("Error al eliminar ticket:", error);
        }
      }
    );
  };



  const handleSelectedPresentation = (selectedOption) => {
    const baseProduct = productWithPresentations;
    if (!baseProduct) {
      mostrarError('Error: Producto base no encontrado.', theme);
      return;
    }

    // Case 1: User chose the special "Sell by base unit" option
    if (selectedOption.id === 'base_product_sale') {
      if (selectedOption.tipo_venta === 'pesable') {
        setProductToWeigh(baseProduct); // Pass the base product itself
        setIsPesableModalOpen(true);
        setWeight('');
      } else { // It's a unitario product
        const quantityToAdd = pendingQuantity || 1;
        handleAddItemToCart(baseProduct, quantityToAdd);
      }
    }
    // Case 2: User chose a real presentation
    else {
      const fullPresentationData = baseProduct.presentations.find(p => p.id === selectedOption.id);
      if (!fullPresentationData) {
        mostrarError('Error: Datos de la presentación no encontrados.', theme);
        return;
      }

      // Whether the base product is weighable or not, a presentation has a fixed price and quantity.
      // Just add it to the cart.
      const quantityOfPresentationsToAdd = pendingQuantity || 1;
      addPresentationToCart(fullPresentationData, baseProduct, quantityOfPresentationsToAdd);
    }

    // Common cleanup for all paths
    setIsPresentationModalOpen(false);
    setProductWithPresentations(null);
    setPendingQuantity(null);
    setCustomQuantityMode(false);
    setCustomQuantity('');
    setTimeout(() => {
      inputRefCodigoBarra.current?.focus();
    }, 100);
  };

  const addPresentationToCart = (presentation, baseProduct, quantity, forceSale = false) => {
    const totalBaseUnitsForStock = quantity * presentation.quantity_in_base_units;
    const priceOfOnePresentation = presentation.price;
    const totalCostForPresentations = quantity * priceOfOnePresentation;

    const existingItemIndex = tempTable.findIndex(item =>
      item.stock_id === baseProduct.id && item.presentation_id === presentation.id
    );

    if (existingItemIndex !== -1) {
      setTempTable(prevTable => {
        const updatedTable = [...prevTable];
        const existingItem = { ...updatedTable[existingItemIndex] };
        existingItem.quantity += quantity;
        existingItem.cost += totalCostForPresentations;
        existingItem.quantity_for_stock_deduction += totalBaseUnitsForStock;
        if (forceSale) {
          existingItem.force_sale = true;
        }
        updatedTable[existingItemIndex] = existingItem;
        return updatedTable;
      });
    } else {
      const itemToAdd = {
        temp_id: Date.now() + Math.random(),
        stock_id: baseProduct.id,
        presentation_id: presentation.id,
        quantity: quantity,
        price: priceOfOnePresentation,
        name: `${baseProduct.name} (${presentation.name})`,
        description: baseProduct.description,
        category_id: baseProduct.category_id,
        units_id: baseProduct.units_id,
        cost: totalCostForPresentations,
        force_sale: forceSale,
        is_manual_entry: false,
        quantity_for_stock_deduction: totalBaseUnitsForStock,
        type: 'presentation'
      };
      setTempTable(prevTable => [itemToAdd, ...prevTable]);
    }
  };

  const handleAddItemToCart = (product, quantity) => {
    const existingItem = tempTable.find(item => item.stock_id === product.id && item.type === 'product');
    const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
    const requestedQuantity = currentQuantityInCart + quantity;

    // Use the stock from the product object that was just scanned and passed in.
    // Also, parse it to a number to be safe.
    const availableStock = parseFloat(product.stock);

    if (availableStock < requestedQuantity) {
      mostrarConfirmacion({
        title: 'Stock Insuficiente',
        html: `
          <p>Producto: <strong>${product.name}</strong></p>
          <p>Stock Disponible: <strong>${availableStock}</strong></p>
          <p>Stock Solicitado: <strong>${requestedQuantity}</strong></p>
          <br/>
          <p>¿Desea continuar la venta y dejar el stock en negativo?</p>
        `,
        icon: 'warning',
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'No, cancelar'
      }, theme, () => {
        // Forzar venta
        addItem(product, quantity, true);
      });
    } else {
      // Stock suficiente
      addItem(product, quantity, false);
    }
  };

  const addItem = (product, quantity, forceSale = false) => {
    const existingItemIndex = tempTable.findIndex(item => item.stock_id === product.id && item.type === 'product');

    if (existingItemIndex !== -1) {
      setTempTable(prevTable => {
        const updatedTable = [...prevTable];
        const existingItem = { ...updatedTable[existingItemIndex] };
        existingItem.quantity += quantity;
        existingItem.cost = existingItem.quantity * parseFloat(existingItem.price);
        existingItem.quantity_for_stock_deduction = existingItem.quantity;
        if (forceSale) {
          existingItem.force_sale = true;
        }
        updatedTable[existingItemIndex] = existingItem;
        return updatedTable;
      });
    } else {
      const itemToAdd = {
        temp_id: Date.now() + Math.random(),
        stock_id: product.id,
        quantity: quantity,
        price: product.price,
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        units_id: product.units_id,
        cost: quantity * parseFloat(product.price),
        force_sale: forceSale,
        quantity_for_stock_deduction: quantity,
        type: 'product'
      };
      setTempTable(prevTable => [itemToAdd, ...prevTable]);
    }

    setSelectedProduct(null);
    setCustomQuantityMode(false);
    setCustomQuantity('');
    setTimeout(() => {
      inputRefCodigoBarra.current?.focus();
    }, 100);
  };

  const handleAddPesableProduct = () => {
    if (!productToWeigh || !weight || parseFloat(weight) <= 0) {
      mostrarError('Por favor, ingrese un peso válido.', theme);
      return;
    }

    const enteredWeight = parseFloat(weight);
    let itemToAdd;
    let stockItem;

    if (productToWeigh.stock_id) { // It's a presentation
      stockItem = stock?.products?.find(p => p.id === productToWeigh.stock_id);
      if (!stockItem) {
        mostrarError('Error: Producto base no encontrado para la presentación pesable.', theme);
        return;
      }

      const pricePerBaseUnitOfPresentation = productToWeigh.price / productToWeigh.quantity_in_base_units;
      const calculatedCost = enteredWeight * pricePerBaseUnitOfPresentation;

      itemToAdd = {
        temp_id: Date.now() + Math.random(),
        stock_id: productToWeigh.stock_id,
        presentation_id: productToWeigh.id,
        quantity: enteredWeight,
        price: pricePerBaseUnitOfPresentation,
        name: `${stockItem.name} (${productToWeigh.name})`,
        description: stockItem.description,
        category_id: stockItem.category_id,
        units_id: stockItem.units_id,
        cost: calculatedCost,
        force_sale: false,
        is_manual_entry: false,
        quantity_for_stock_deduction: enteredWeight,
        type: 'presentation'
      };
    } else { // It's a base product
      stockItem = productToWeigh;
      const calculatedCost = enteredWeight * stockItem.price;
      itemToAdd = {
        temp_id: Date.now() + Math.random(),
        stock_id: stockItem.id,
        quantity: enteredWeight,
        price: stockItem.price,
        name: stockItem.name,
        description: stockItem.description,
        category_id: stockItem.category_id,
        units_id: stockItem.units_id,
        cost: calculatedCost,
        force_sale: false,
        is_manual_entry: false,
        quantity_for_stock_deduction: enteredWeight,
        type: 'product'
      };
    }

    const availableStock = stockItem ? stockItem.stock : 0;

    if (availableStock < itemToAdd.quantity_for_stock_deduction) {
      // Cerrar el modal de peso ANTES de mostrar la alerta
      setIsPesableModalOpen(false);

      setTimeout(() => {
        mostrarConfirmacion({
          title: 'Stock Insuficiente',
          html: `
              <p>Producto: <strong>${itemToAdd.name}</strong></p>
              <p>Stock Disponible: <strong>${availableStock}</strong></p>
              <p>Cantidad Solicitada: <strong>${itemToAdd.quantity_for_stock_deduction}</strong></p>
              <br/>
              <p>¿Desea continuar la venta y dejar el stock en negativo?</p>
            `,
          icon: 'warning',
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'No, corregir'
        }, theme,
          () => { // onConfirm: Forzar venta
            setTempTable(prevTable => [{ ...itemToAdd, force_sale: true }, ...prevTable]);
            setProductToWeigh(null);
            setWeight('');
            setPendingQuantity(null);
            setValues(prev => ({ ...prev, barcode: '' }));
            setTimeout(() => inputRefCodigoBarra.current?.focus(), 100);
          },
          () => { // onCancel: Volver a abrir el modal para corregir
            setIsPesableModalOpen(true);
          }
        );
      }, 300); // Delay to allow modal to close
    } else {
      setTempTable(prevTable => [itemToAdd, ...prevTable]);
      setIsPesableModalOpen(false);
      setProductToWeigh(null);
      setWeight('');
      setPendingQuantity(null);
      setValues(prev => ({ ...prev, barcode: '' }));
      setTimeout(() => {
        inputRefCodigoBarra.current?.focus();
      }, 100);
    }
  };

  const handleCustomQuantityEntry = (barcode) => {
    const quantity = parseFloat(barcode);
    if (!isNaN(quantity) && quantity > 0) {
      setPendingQuantity(quantity);
      setCustomQuantity(barcode);
      setValues(prevValues => ({ ...prevValues, barcode: '' }));
      inputRefCodigoBarra.current?.focus();
      return true;
    } else {
      mostrarError('Ingrese una cantidad válida para la cantidad personalizada.', theme);
      return false;
    }
  };

  const handleQuickQuantityEntry = (tempQuantityValue) => {
    const quantity = parseFloat(tempQuantityValue);
    if (!isNaN(quantity) && quantity > 0) {
      setPendingQuantity(quantity);
      setIsQuantityMode(false);
      setTempQuantity('');
      return true;
    } else {
      mostrarError('Ingrese una cantidad válida.', theme);
      return false;
    }
  };

  const handleBarcodeScanLogic = async (barcode) => {
    if (!validator.isNumeric(barcode) || barcode.length !== 13) {
      mostrarError('Código de barras inválido. Debe ser numérico y de 13 dígitos.', theme);
      setValues(prev => ({ ...prev, barcode: '' }));
      inputRefCodigoBarra.current?.focus();
      return;
    }

    setIsScanningBarcode(true);
    try {
      const { data: item } = await Api.get(`/stock/barcode/${barcode}`);

      if (!item) {
        mostrarInfo('Producto o combo no encontrado. Presione "Alt+x" para ingresar manualmente', theme);
        setIsManualEntryMode(true);
        setValues({});
        setSelectedProduct(null);
        return; // Salir del bloque try, finally se ejecutará
      }

      const quantityToAdd = pendingQuantity || 1;

      if (item.type === 'combo') {
        const existingItemIndex = tempTable.findIndex(i => i.id === item.id && i.type === 'combo');
        if (existingItemIndex !== -1) {
          setTempTable(prevTable => {
            const updatedTable = [...prevTable];
            const existingItem = { ...updatedTable[existingItemIndex] };
            existingItem.quantity += quantityToAdd;
            existingItem.cost = existingItem.quantity * parseFloat(existingItem.price);
            updatedTable[existingItemIndex] = existingItem;
            return updatedTable;
          });
        } else {
          const itemToAdd = {
            temp_id: Date.now() + Math.random(),
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: quantityToAdd,
            cost: quantityToAdd * parseFloat(item.price),
            type: 'combo',
            description: item.combo_items.map(ci => {
              const num = parseFloat(ci.quantity);
              const formattedQty = num % 1 === 0 ? num : num.toFixed(3);
              return `${formattedQty}x ${ci.stock.name}`;
            }).join(', ')
          };
          setTempTable(prevTable => [itemToAdd, ...prevTable]);
        }
      } else if (item.type === 'presentation') {
        // The backend returns the presentation and its nested base product (`item.stock`)
        // We can directly add it to the cart.
        addPresentationToCart(item, item.stock, quantityToAdd);
      } else if (item.type === 'product') {
        if (pendingQuantity && item.presentations && item.presentations.length > 0) {
          const matchingPresentation = item.presentations.find(p => parseFloat(p.quantity_in_base_units) === pendingQuantity);

          if (matchingPresentation) {
            const stockItem = stock?.products?.find(s => s.id === item.id);
            const availableStock = parseFloat(stockItem ? stockItem.stock : 0);
            const stockToDeduct = parseFloat(matchingPresentation.quantity_in_base_units);

            if (availableStock < stockToDeduct) {
              mostrarConfirmacion({
                title: 'Stock Insuficiente',
                html: `<p>Stock insuficiente para la presentación <strong>${matchingPresentation.name}</strong>.</p><p>¿Desea forzar la venta?</p>`,
                icon: 'warning',
                confirmButtonText: 'Sí, continuar',
                cancelButtonText: 'No, cancelar'
              }, theme, () => {
                addPresentationToCart(matchingPresentation, item, 1, true);
              });
            } else {
              addPresentationToCart(matchingPresentation, item, 1, false);
            }
            return; // Salir, finally se encargará de la limpieza
          }
        }

        if (item.tipo_venta === 'pesable') {
          setProductToWeigh(item);
          setIsPesableModalOpen(true);
          setWeight('');
        } else {
          handleAddItemToCart(item, quantityToAdd);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        mostrarInfo('Producto o combo no encontrado. Presione "Alt+x" para ingresar manualmente', theme);
        setIsManualEntryMode(true);
        setValues({});
        setSelectedProduct(null);
      } else {
        mostrarError('Error al buscar el producto.', theme);
        console.error(error);
      }
    } finally {
      setIsScanningBarcode(false);
      setPendingQuantity(null);
      setValues(prev => ({ ...prev, barcode: '' }));
      setCustomQuantityMode(false);
      setCustomQuantity('');
      inputRefCodigoBarra.current?.focus();
    }
  };

  const handleScan = async (e) => {
    const barcode = e.target.value.trim();

    // Prevent "phantom search"
    if (e.key === 'Enter' && barcode === '') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (customQuantityMode && !customQuantity) {
        handleCustomQuantityEntry(barcode);
      } else if (isQuantityMode) {
        handleQuickQuantityEntry(barcode);
      } else if (!isManualEntryMode) {
        handleBarcodeScanLogic(barcode);
      }
    } else if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      setIsQuantityMode(true);
      setTempQuantity('');
      mostrarInfo('Modo Cantidad Rápida. Ingrese la cantidad y presione Enter.', theme);
    } else if (isQuantityMode) {
      if (e.key === 'Escape') {
        setIsQuantityMode(false);
        setTempQuantity('');
      } else if (!isNaN(parseFloat(e.key)) || e.key === '.') {
        setTempQuantity((prev) => prev + e.key);
      }
    }
  };







  const columns = useMemo(() => [
    {
      id: 'name',
      label: 'Producto',
      align: 'left',
      valueGetter: ({ row }) => (
        <Box>
          <Typography>{row.name}</Typography>
          {row.promotion && (
            <Typography variant="caption" color="success.main">
              {row.promotion.name}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'description',
      label: 'Descripción',
      align: 'left',
      valueGetter: ({ row }) => row.description,
    },
    {
      id: 'quantity',
      label: 'Cantidad',
      align: 'center',
      valueGetter: ({ row }) => {
        const num = parseFloat(row.quantity);
        if (isNaN(num)) return '';
        // Si el número es un entero, muéstralo sin decimales.
        // Si es un decimal (ej. producto pesable), muéstralo con 3 decimales.
        return num % 1 === 0 ? num : num.toFixed(3);
      },
    },
    {
      id: 'price',
      label: 'Precio Unitario',
      align: 'center',
      valueGetter: ({ row }) => `${parseFloat(row.price).toFixed(2)}`,
    },
    {
      id: 'cost',
      label: 'Costo Total',
      align: 'center',
      valueGetter: ({ row }) => `${parseFloat(row.cost).toFixed(2)}`,
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'center',
      valueGetter: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
          <Tooltip title="Editar">
            <IconButton color="primary" size="small" onClick={() => editItemTempTable(row.temp_id)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton color="error" size="small" onClick={() => deletingItemTempTable(row.temp_id)}>
              <DeleteForeverIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [tempTable]); // Depend on tempTable to have access to the full array for index finding

  const debouncedSetSearchTerm = useCallback(
    debounce((newValue) => {
      setProductSearchTerm(newValue);
    }, 500), // 500ms de delay
    []
  );

  const handleAutocompleteChange = useCallback((event, value, reason, details) => {
    // --- INICIO: SOLUCIÓN AL BUG DE TECLADO ---
    if (event && event.type === 'keydown' && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      autocompleteInputRef.current?.blur();
    }
    // --- FIN: SOLUCIÓN AL BUG DE TECLADO ---

    if (reason !== 'selectOption' || !details || !details.option) {
      setValues({});
      setSelectedProduct(null);
      setTimeout(() => { inputRefCodigoBarra.current?.focus(); }, 100);
      return;
    }

    const selectedId = details.option.id;
    const product = stock?.products?.find(p => p.id === selectedId);

    if (!product) {
      mostrarError('Error: No se pudo encontrar el producto seleccionado.', theme);
      setTimeout(() => { inputRefCodigoBarra.current?.focus(); }, 100);
      return;
    }

    const hasPresentations = product.presentations && product.presentations.length > 0;
    let aModalWillOpen = false;

    if (hasPresentations) {
      const retailSaleOption = {
        id: 'base_product_sale',
        name: product.tipo_venta === 'pesable' ? `Vender por Peso (Minorista a ${product.price}/kg)` : `Vender por Unidad (a ${product.price})`,
        price: product.price,
        quantity_in_base_units: 1,
        tipo_venta: product.tipo_venta
      };
      setProductWithPresentations({ ...product, presentations: [retailSaleOption, ...product.presentations] });
      setIsPresentationModalOpen(true);
      aModalWillOpen = true;
    } else if (product.tipo_venta === 'pesable') {
      setProductToWeigh(product);
      setIsPesableModalOpen(true);
      setWeight('');
      aModalWillOpen = true;
    } else {
      const quantityToAdd = pendingQuantity || 1;
      handleAddItemToCart(product, quantityToAdd);
      setPendingQuantity(null);
    }

    setSelectedProduct(null);
    setValues({});
    if (!aModalWillOpen) {
      setTimeout(() => inputRefCodigoBarra.current?.focus(), 100);
    }
  }, [stock, theme, pendingQuantity, handleAddItemToCart]); // Dependencias del useCallback

  if (isCheckingSession) {
    return <VentasSkeleton />;
  }

  if (!isSessionActive) {
    return (
      <>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center',
            p: 3,
          }}
        >
          <LockClockIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ color: theme.palette.text.primary }}>
            Caja Cerrada
          </Typography>
          <Alert severity="warning" sx={{ mb: 3, maxWidth: '500px', bgcolor: 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.5)' }}>
            Para poder registrar ventas, primero necesitas iniciar tu sesión de caja.
          </Alert>
          <StyledButton
            variant="contained"
            size="large"
            startIcon={<PointOfSaleIcon />}
            onClick={handleOpenCajaModal}
          >
            Abrir Caja
          </StyledButton>
        </Box>
        {isCajaModalOpen && (
          <CajaManager
            open={isCajaModalOpen}
            onClose={handleCloseCajaModal}
            userId={usuario?.id}
            onSessionCreated={() => {
              refetchSession(); // Volver a consultar el estado de la sesión
              handleCloseCajaModal(); // Cerrar el modal y refrescar de nuevo si es necesario
            }}
          />
        )}
      </>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="enter"
      exit="exit"
      variants={variants}
      transition={{ duration: 0.5, type: "easeInOut" }}
    >
      <Box sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        // Altura de la ventana (100vh) menos la altura del AppBar (theme.mixins.toolbar)
        // y el padding vertical del contenedor principal (asumimos theme.spacing(3) * 2)
        height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${theme.spacing(1)})`,
        overflow: 'hidden' // Prevenir el scroll de la página principal
      })}>

        {/* --- Top Section (Inputs & Total) --- */}
        <Box sx={{ p: 1 }}>
          <Grid container sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center', flexDirection: 'column' }}>
            {/* Indicador de ticket pendiente */}
            {currentTicketId && (
              <Box sx={{
                bgcolor: 'rgba(99, 179, 237, 0.2)', border: '1px solid #63b3ed', borderRadius: 2,
                px: 2, py: 1, mb: 2, mt: 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', maxWidth: '400px', mx: 'auto'
              }}>
                <Typography variant="body2" sx={{ color: '#63b3ed', fontWeight: 'medium' }}>
                  📝 Editando Ticket Pendiente
                </Typography>
                <Tooltip title="Cancelar Edición">
                  <IconButton onClick={handleCancelEdit} size="small" sx={{ ml: 1 }}>
                    <ClearIcon sx={{ fontSize: 18, color: '#63b3ed' }} />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            {/* Botón de tickets pendientes */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, flexDirection: 'column', alignItems: 'center' }}>
              <StyledButton
                variant="outlined" color="info" onClick={() => { setPendingTicketsModalMode('full'); setShowPendingTickets(true); }}
                startIcon={<ReceiptIcon />} size="small"
                sx={{ mt: 1, color: theme.palette.info.main, borderColor: theme.palette.info.main, '&:hover': { borderColor: theme.palette.info.main, color: theme.palette.info.main } }}
              >
                Tickets Pendientes ({pendingTickets.length})
              </StyledButton>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}> {/* New Box for chips */}
                <Chip label="Alt + P: Guardar" size="small" color="info" />
              </Box>
            </Box>
          </Grid>
          <Grid container rowSpacing={2} columnSpacing={2} sx={{ display: 'flex', justifyContent: 'center', alignContent: 'center' }}>
            {/* Indicador de modo actual */}
            {(isManualEntryMode || isQuantityMode || customQuantityMode) && (
              <Grid sx={{ width: '100%', maxWidth: '400px', mb: 2 }}>
                <Box sx={{
                  bgcolor: isQuantityMode ? 'rgba(33, 150, 243, 0.1)' : customQuantityMode ? 'rgba(156, 39, 176, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                  border: '1px solid', borderColor: isQuantityMode ? theme.palette.info.main : customQuantityMode ? theme.palette.secondary.main : theme.palette.warning.main,
                  borderRadius: 2, px: 1, py: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <Typography variant="body2" sx={{ color: isQuantityMode ? theme.palette.info.dark : customQuantityMode ? theme.palette.secondary.dark : theme.palette.warning.dark, fontWeight: 'medium', pl: 1 }}>
                    {isQuantityMode ? (<>🔢 Cantidad Rápida: {tempQuantity}</>) : customQuantityMode && !customQuantity ? (<>🔢 Ingrese cantidad</>) : customQuantityMode && customQuantity ? (<>✅ Cantidad: {customQuantity} - Escanee código</>) : (<>✏️ Entrada Manual - Presione "Alt+x"</>)}
                  </Typography>
                  {(customQuantityMode || isQuantityMode) && (
                    <Tooltip title="Cancelar modo cantidad">
                      <IconButton size="small" onClick={() => { setIsQuantityMode(false); setTempQuantity(''); setCustomQuantityMode(false); setCustomQuantity(''); setPendingQuantity(null); inputRefCodigoBarra.current?.focus(); }}>
                        <ClearIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Grid>
            )}
            <Grid container spacing={2} sx={{ width: '100%', maxWidth: '900px', justifyContent: 'center' }}>
              <Grid xs={12} sm={6}>
                <StyledTextField
                  autoFocus size="small" sx={{ mb: 2, width: '100%' }}
                  disabled={isScanningBarcode}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><IconButton size="small" onClick={() => { setValues(prev => ({ ...prev, barcode: '' })); inputRefCodigoBarra.current?.focus(); }}><ClearIcon color='error' /></IconButton></InputAdornment>),
                    endAdornment: (
                      isScanningBarcode && (
                        <InputAdornment position="end">
                          <CircularProgress size={20} />
                        </InputAdornment>
                      )
                    )
                  }}
                  onInput={(e) => { if (!isQuantityMode && (!customQuantityMode || (customQuantityMode && customQuantity))) { e.target.value = (e.target.value).toString().slice(0, 13); } }}
                  type='number' value={values?.barcode || ''} name='barcode' autoComplete='off'
                  onKeyDown={handleScan} onChange={handleValuesChange}
                  label={customQuantityMode && !customQuantity ? 'Ingrese Cantidad' : isQuantityMode ? 'Ingrese Cantidad' : 'Codigo de Barras'}
                  helperText={!isManualEntryMode && !isQuantityMode && !customQuantityMode ? 'Alt+X: entrada manual, Alt+C: cantidad personalizada' : customQuantityMode && !customQuantity ? 'Ingrese cantidad - Luego presione Enter' : customQuantityMode && customQuantity ? 'Escanee código de barras' : ''}
                  inputRef={inputRefCodigoBarra}
                />
              </Grid>
              <Grid xs={12} sm={6}>
                <StyledAutocomplete
                  value={selectedProduct}
                  isOptionEqualToValue={(option, value) => option.id === value?.id}
                  clearText='Limpiar'
                  size="small"
                  sx={{ mb: 2, width: '100%' }}
                  onChange={handleAutocompleteChange}
                  onInputChange={(event, newInputValue) => {
                    debouncedSetSearchTerm(newInputValue);
                  }}
                  options={Array.isArray(stock?.products) ? stock.products : []}
                  loading={stockLoading}
                  filterOptions={(x) => x}
                  getOptionKey={(option) => option.id}
                  getOptionLabel={(option) => option.name || ""}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      label="Selecciona un producto"
                      variant="outlined"
                      size="small"
                      helperText="Alt+B: Busque y seleccione un producto del inventario"
                      inputRef={autocompleteInputRef}
                      autoComplete="off"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {stockLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
            {/* Total Display */}
            {tempTable.length > 0 && (
              <Grid sx={{ width: '30%', maxWidth: '800px' }}>
                <Paper elevation={2} sx={{ backgroundColor: theme.palette.background.tableHeader, color: 'primary.contrastText', display: 'flex', mt: -0.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', m: 0, p: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'medium' }}>TOTAL:</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>${totalFinal.toFixed(2)}</Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </Box>

        {/* --- Middle Section (Scrollable Table) --- */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0, px: 2 }}>
          {tempTable.length > 0 && (
            <Paper sx={{ borderRadius: 2 }}>
              <EnhancedTable
                columns={columns}
                data={processedTempTable}
                pagination={false}
              />
            </Paper>
          )}
        </Box>

        {/* --- Bottom Section (Finalize Button) --- */}
        <Box sx={{ p: 2 }}>
          {tempTable.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <StyledButton
                variant="contained" color="success" onClick={() => setIsSummaryModalOpen(true)}
                startIcon={<ShoppingCartIcon />} size="large"
                sx={{
                  fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 24px)',
                  borderRadius: '8px', boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                  '&:hover': { boxShadow: '0 6px 16px rgba(76, 175, 80, 0.6)' }
                }}
              >
                Finalizar Venta (Alt + F)
              </StyledButton>
            </Box>
          )}
        </Box>
      </Box>

      {/* --- Modals Section (fuera del layout principal) --- */}
      <>
        {/* Modal de Resumen de la Venta */}
        <SummarySaleModal
          isSummaryModalOpen={isSummaryModalOpen}
          onClose={() => {
            setIsSummaryModalOpen(false);
            setTimeout(() => {
              inputRefCodigoBarra.current?.focus();
            }, 100);
          }}
          tempTable={tempTable}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          paymentOption={paymentOption}
          setPaymentOption={setPaymentOption}
          selectedSinglePaymentType={selectedSinglePaymentType}
          setSelectedSinglePaymentType={setSelectedSinglePaymentType}
          mixedPayments={mixedPayments}
          setMixedPayments={setMixedPayments}
          ivaActivo={ivaActivo}
          setIvaActivo={setIvaActivo}
          descuento={descuento}
          setDescuento={setDescuento}
          amountReceived={amountReceived}
          setAmountReceived={setAmountReceived}
          handleSaveSale={handleSaveSale}
          handleSavePendingTicket={handleSavePendingTicket}
          setShowPendingTickets={() => {
            setPendingTicketsModalMode('infoOnly');
            setShowPendingTickets(true);
          }}
          pendingTickets={pendingTickets}
          calcularTotal={calcularTotal}
          validateMixedPayments={validateMixedPayments}
          isConfirmButtonDisabled={isConfirmButtonDisabled}
          summaryError={summaryError} // <-- Pasar el error
          loadingSale={isSavingSale} // <--- REEMPLAZAR AQUÍ
          paymentMethods={paymentMethods}
          customers={customers}
          paymentLoading={paymentLoading}
          customersLoading={customersLoading}
          amountReceivedInputRef={amountReceivedInputRef} // <--- Pasar el ref
          inputRefCodigoBarra={inputRefCodigoBarra}
          setCurrentTicketId={setCurrentTicketId}
          setTempTable={setTempTable}
          setValues={setValues}
          setSelectedProduct={setSelectedProduct}
          confirmButtonRef={confirmSaleButtonRef} // <-- Pasar el ref al modal
        />

        {/* Modal para entrada manual de productos */}
        <ManualEntryModal
          showManualEntryModal={showManualEntryModal}
          handleCloseManualEntryModal={handleCloseManualEntryModal}
          editingItem={editingItem}
          formValues={formValues}
          handleInputChange={handleInputChange}
          manualProductNameRef={manualProductNameRef}


          handleManualEntrySubmit={handleManualEntrySubmit}
        />

        {/* Modal para tickets pendientes */}
        <PendingTicketsModal
          showPendingTickets={showPendingTickets}
          setShowPendingTickets={setShowPendingTickets}
          pendingTickets={pendingTickets}
          handleLoadPendingTicket={pendingTicketsModalMode === 'full' ? handleLoadPendingTicket : null}
          handleDeletePendingTicket={handleDeletePendingTicket}
          allowLoading={pendingTicketsModalMode === 'full'}
        />

        <PesableProductModal
          isPesableModalOpen={isPesableModalOpen}
          onClose={() => {
            setIsPesableModalOpen(false);
            setProductToWeigh(null);
            setWeight('');
            setTimeout(() => {
              inputRefCodigoBarra.current?.focus();
            }, 100);
          }}
          onAdd={handleAddPesableProduct}
          product={productToWeigh}
          weight={weight}
          setWeight={setWeight}
          weightInputRef={weightInputRef}
        />

        <ProductPresentationModal
          open={isPresentationModalOpen}
          onClose={handlePresentationModalClose}
          product={productWithPresentations}
          onSelectPresentation={handleSelectedPresentation}
        />
      </>
    </motion.div >
  );
};

export default Ventas;