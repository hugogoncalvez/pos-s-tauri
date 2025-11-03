import { useState } from 'react';
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Grid,
  Divider,
  InputAdornment,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Alert,
  useTheme,
  Box
} from '@mui/material';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import { StyledTextField } from './ui/StyledTextField';
import { StyledAutocomplete } from './ui/StyledAutocomplete';
import { StyledCard } from './ui/StyledCard';
import ClearIcon from '@mui/icons-material/Clear';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { mostrarConfirmacion } from '../functions/mostrarConfirmacion';

const SurchargeBreakdownDisplay = ({ open, surchargeDetails, totalRecargos }) => {
  const hasContent = surchargeDetails && surchargeDetails.some(d => d.surchargeAmount > 0);

  return (
    <Box sx={{
      height: open && hasContent ? 'auto' : 0,
      overflow: 'hidden',
      transition: 'height 0.3s ease-in-out, padding 0.3s ease-in-out',
      pt: open && hasContent ? 1 : 0,
    }}>
      {hasContent && (
        <Box sx={{ p: 1, bgcolor: 'rgba(255, 152, 0, 0.08)', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Desglose de Recargos:
          </Typography>
          {surchargeDetails.map((detail, index) => (
            detail.surchargeAmount > 0 && (
              <Grid container key={index} spacing={1} sx={{ mb: 0.5, alignItems: 'center' }}>
                <Grid item xs={5}>
                  <Typography variant="body2">{detail.methodName}:</Typography>
                </Grid>
                <Grid item xs={3} sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">${detail.amountEntered.toFixed(2)}</Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="warning.main">
                    +${detail.surchargeAmount.toFixed(2)} ({detail.percentage}%)
                  </Typography>
                </Grid>
              </Grid>
            )
          ))}
        </Box>
      )}
    </Box>
  );
};

const SummarySaleModal = ({
  isSummaryModalOpen,
  onClose,
  tempTable,
  selectedCustomer,
  setSelectedCustomer,
  paymentOption,
  setPaymentOption,
  selectedSinglePaymentType,
  setSelectedSinglePaymentType,
  mixedPayments,
  setMixedPayments,
  ivaActivo,
  setIvaActivo,
  descuento,
  setDescuento,
  amountReceived,
  setAmountReceived,
  handleSaveSale,
  handleSavePendingTicket,
  setShowPendingTickets,
  pendingTickets,
  calcularTotal,
  validateMixedPayments,
  isConfirmButtonDisabled,
  summaryError,
  loadingSale,
  paymentMethods,
  customers,
  paymentLoading,
  customersLoading,
  amountReceivedInputRef,
  inputRefCodigoBarra,
  setCurrentTicketId,
  currentTicketId,
  setTempTable,
  setValues,
  setSelectedProduct,
  confirmButtonRef,
}) => {
  //console.log('[SummarySaleModal] currentTicketId:', currentTicketId);
  //console.log('[SummarySaleModal] tempTable.length:', tempTable.length);
  const theme = useTheme();
  const { subtotal, impuesto, descuento: descuentoAplicado, surchargeAmount, surchargeDetails, totalFinal } = calcularTotal();
  const [surchargeDetailsOpen, setSurchargeDetailsOpen] = useState(false);
  const handleCancelSale = () => {
    mostrarConfirmacion(
      {
        title: '¿Cancelar Venta?',
        text: 'Se borrarán todos los productos de la venta actual.',
        confirmButtonText: 'Sí, cancelar'
      },
      theme,
      () => { // onConfirm
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
        onClose(); // Use onClose prop
        inputRefCodigoBarra.current?.focus();
      }
    );
  };

  return (
    <StyledDialog
      open={isSummaryModalOpen}
      onClose={onClose} // Use onClose prop
      aria-labelledby="summary-sale-dialog-title"
      maxWidth="lg"
      fullWidth
    >
      {loadingSale && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2,
            borderRadius: 'inherit',
          }}
        >
          <CircularProgress color="primary" />
          <Typography variant="h6" sx={{ mt: 2, color: 'white' }}>
            Guardando Venta...
          </Typography>
        </Box>
      )}
      <DialogTitle
        id="summary-sale-dialog-title"
        sx={{ display: 'flex', alignItems: 'center', backgroundColor: 'background.dialog', color: 'text.primary' }}
      >
        <ReceiptIcon sx={{ mr: 1, color: 'info.main' }} />
        Resumen de la Venta
        <IconButton
          aria-label="close"
          onClick={onClose} // Use onClose prop
          color="error"
          sx={{ position: 'absolute', right: 20, top: 20 }}
        >
          <ClearIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, backgroundColor: 'background.dialog' }}>
        {summaryError && (
          <Alert severity="error" sx={{ mb: 2 }}>{summaryError}</Alert>
        )}
        <Grid container spacing={3} sx={{ alignItems: 'center', pt: 1 }}>
          <Grid item xs={12} sm={4}>
            <StyledAutocomplete
              value={selectedCustomer}
              onChange={(event, value) => setSelectedCustomer(value)}
              options={Array.isArray(customers) ? customers : []}
              getOptionLabel={(option) => option.name || option.nombre || 'Sin nombre'}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={customersLoading}
              size="small"
              renderInput={(params) => (
                <StyledTextField
                  {...params}
                  label="Cliente"
                  variant="outlined"
                  size="small"
                  helperText={customersLoading ? "Cargando clientes..." : ""}
                  autoComplete="off"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <StyledAutocomplete
              value={paymentOption === 'mixed' ? { id: 'mixed', method: 'Mixto', nombre: 'Mixto' } : selectedSinglePaymentType}
              onChange={(event, value) => {
                if (value && (value.method === 'Mixto' || value.nombre === 'Mixto')) {
                  setPaymentOption('mixed');
                  setSelectedSinglePaymentType(null);
                } else {
                  setPaymentOption('single');
                  setSelectedSinglePaymentType(value);
                  setMixedPayments([{ payment_method_id: null, amount: '' }, { payment_method_id: null, amount: '' }]);
                }
              }}
              options={Array.isArray(paymentMethods) ? [...paymentMethods.filter(pm => pm.method !== 'Mixto' && pm.nombre !== 'Mixto'), { id: 'mixed', method: 'Mixto', nombre: 'Mixto' }] : [{ id: 'mixed', method: 'Mixto', nombre: 'Mixto' }]}
              getOptionLabel={(option) => option.method || option.nombre || 'Sin método'}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={paymentLoading}
              size="small"
              renderInput={(params) => (
                <StyledTextField
                  {...params}
                  label="Método de Pago"
                  variant="outlined"
                  size="small"
                  helperText={paymentLoading ? "Cargando métodos..." : ""}
                  autoComplete="off"
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <StyledTextField
              label="Descuento"
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              size="small"
              fullWidth
              autoComplete="off"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControlLabel
              control={<Switch checked={ivaActivo} onChange={(e) => setIvaActivo(e.target.checked)} size="small" />}
              label="Aplicar IVA (21%)"
              sx={{ whiteSpace: 'nowrap', ml: 1 }}
              componentsProps={{ typography: { accessKey: undefined } }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={1}>
          <Grid item xs={6}><Typography>Subtotal:</Typography></Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography>${subtotal.toFixed(2)}</Typography></Grid>

          {ivaActivo && (
            <>
              <Grid item xs={6}><Typography>IVA (21%):</Typography></Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography>${impuesto.toFixed(2)}</Typography></Grid>
            </>
          )}

          {descuentoAplicado > 0 && (
            <>
              <Grid item xs={6}><Typography color="error">Descuento:</Typography></Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography color="error">-${descuentoAplicado.toFixed(2)}</Typography></Grid>
            </>
          )}

          {surchargeAmount > 0 && (
            <>
              <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography color="warning.main">Recargo:</Typography>
                <IconButton size="small" onClick={() => setSurchargeDetailsOpen(!surchargeDetailsOpen)}>
                  <KeyboardArrowDown sx={{ fontSize: '1.2rem', transition: 'transform 0.3s', transform: surchargeDetailsOpen ? 'rotate(-180deg)' : 'rotate(0)', color: 'warning.main' }} />
                </IconButton>
              </Grid>
              <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography color="warning.main">+${surchargeAmount.toFixed(2)}</Typography></Grid>
            </>
          )}

          <Grid item xs={12}>
            <SurchargeBreakdownDisplay open={surchargeDetailsOpen} surchargeDetails={surchargeDetails} totalRecargos={surchargeAmount} />
          </Grid>

          <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
          <Grid item xs={6}><Typography variant="h6" fontWeight="bold">Total:</Typography></Grid>
          <Grid item xs={6} sx={{ textAlign: 'right' }}><Typography variant="h6" fontWeight="bold">${totalFinal.toFixed(2)}</Typography></Grid>
        </Grid>

        <Box sx={{ pt: 2 }}>
          {paymentOption === 'single' ? (
            <Grid container spacing={1} sx={{ mt: 0, alignItems: 'center' }}>
              <Grid item xs={12} sm={6}>
                <StyledTextField
                  label="Monto Recibido"
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(e.target.value)} // Set as string
                  disabled={selectedSinglePaymentType?.method?.toLowerCase().includes('credito') || selectedSinglePaymentType?.nombre?.toLowerCase().includes('credito')}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                  size="medium"
                  fullWidth
                  inputRef={amountReceivedInputRef}
                  autoComplete="off"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StyledCard sx={{ p: 1 }}>
                  {(() => {
                    const parsedAmount = parseFloat(amountReceived);
                    if (amountReceived === '' || isNaN(parsedAmount)) { // Check for empty string or NaN
                      return (
                        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
                          Cambio: $0.00
                        </Typography>
                      );
                    }

                    const difference = parsedAmount - totalFinal;
                    if (difference >= 0) {
                      return (
                        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          Cambio: ${difference.toFixed(2)}
                        </Typography>
                      );
                    }
                    else {
                      return (
                        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                          Faltan: ${Math.abs(difference).toFixed(2)}
                        </Typography>
                      );
                    }
                  })()}
                </StyledCard>
              </Grid>            </Grid>
          ) : (
            <Box sx={{ mt: 0 }}>
              <Typography variant="subtitle1" gutterBottom>Pagos Mixtos</Typography>
              <Grid container spacing={1}>
                {mixedPayments.map((payment, index) => {
                  const method = payment.payment_method_id ? paymentMethods?.find(pm => pm.id === payment.payment_method_id) : null;
                  const hasSurcharge = method?.surcharge_active && method?.surcharge_percentage > 0;
                  const surchargeRate = hasSurcharge ? parseFloat(method.surcharge_percentage) / 100 : 0;
                  const amount = parseFloat(payment.amount) || 0;
                  const finalAmount = amount * (1 + surchargeRate);

                  return (
                    <Grid item xs={12} sm={6} key={index}>
                      <StyledAutocomplete
                        value={method}
                        onChange={(event, value) => {
                          const newMixedPayments = [...mixedPayments];
                          newMixedPayments[index].payment_method_id = value ? value.id : null;
                          setMixedPayments(newMixedPayments);
                        }}
                        options={Array.isArray(paymentMethods) ? paymentMethods.filter(pm => pm.method?.toLowerCase() !== 'mixto' && pm.nombre?.toLowerCase() !== 'mixto') : []}
                        getOptionLabel={(option) => option.method || option.nombre || ''}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        size="small"
                        renderInput={(params) => <StyledTextField {...params} label={`Método ${index + 1}`} variant="outlined" size="small" autoComplete="off" />}
                      />
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={hasSurcharge ? 6 : 12}>
                          <StyledTextField
                            label={hasSurcharge ? "Monto Base" : "Monto"}
                            type="number"
                            value={payment.amount}
                            onChange={(e) => {
                              const newMixedPayments = [...mixedPayments];
                              newMixedPayments[index].amount = e.target.value;
                              setMixedPayments(newMixedPayments);
                            }}
                            InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                            size="small"
                            fullWidth
                            autoComplete="off"
                          />
                        </Grid>
                        {hasSurcharge && (
                          <Grid item xs={6}>
                            <StyledTextField
                              label="A Cobrar"
                              type="text"
                              value={finalAmount > 0 ? finalAmount.toFixed(2) : ''}
                              disabled
                              InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                sx: {
                                  color: theme.palette.success.main,
                                  fontWeight: 'bold',
                                  '&.Mui-disabled': {
                                    color: theme.palette.success.main,
                                    WebkitTextFillColor: theme.palette.success.main
                                  }
                                }
                              }}
                              size="small"
                              fullWidth
                            />
                          </Grid>
                        )}
                      </Grid>
                    </Grid>
                  );
                })}
              </Grid>
              {(() => {
                const validationMessage = validateMixedPayments();
                if (validationMessage === true) {
                  return <Alert severity="success" sx={{ mt: 2 }}>Los montos cubren el total.</Alert>;
                }
                if (validationMessage.startsWith('Vuelto') || validationMessage.startsWith('Se ha excedido')) {
                  return <Alert severity="info" sx={{ mt: 2 }}>{validationMessage}</Alert>;
                }
                return <Alert severity="error" sx={{ mt: 2 }}>{validationMessage}</Alert>;
              })()}
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StyledButton
                variant="contained"
                color="success"
                onClick={handleSaveSale}
                disabled={isConfirmButtonDisabled()}
                startIcon={loadingSale ? <CircularProgress size={20} /> : <SaveAsIcon />}
                ref={confirmButtonRef}
              >
                {loadingSale ? 'Guardando...' : 'Confirmar Venta'}
              </StyledButton>
              <Chip label="Alt + V" size="small" sx={{ mt: 0.5 }} />
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StyledButton
                variant="contained"
                onClick={handleSavePendingTicket}
                disabled={tempTable.length === 0 || !!currentTicketId} // Check if currentTicketId has a truthy value (an actual ID)
                startIcon={<PlaylistAddIcon />}
              >
                Guardar Pendiente
              </StyledButton>
              <Chip label="Alt + P" size="small" sx={{ mt: 0.5 }} />
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StyledButton
                sx={{ padding: '3px 12px' }}
                variant="outlined"
                color="info"
                onClick={() => setShowPendingTickets(true)}
                startIcon={<ReceiptIcon />}
              >
                Tickets Pendientes ({pendingTickets.length})
              </StyledButton>
              <Chip label="Alt + M" size="small" sx={{ mt: 0.5 }} />
            </Box>
          </Grid>
          <Grid item>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <StyledButton
                variant="contained"
                color="error"
                onClick={handleCancelSale}
                startIcon={<ClearIcon />}
              >
                Cancelar
              </StyledButton>
              <Chip label="Alt + C" size="small" sx={{ mt: 0.5 }} />
            </Box>
          </Grid>
        </Grid>
      </DialogActions>
    </StyledDialog>
  );
};

export default SummarySaleModal;
