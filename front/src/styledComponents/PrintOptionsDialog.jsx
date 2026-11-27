import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Checkbox,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup,
    Typography
} from '@mui/material';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';

/**
 * Diálogo para configurar el formato y los métodos que se detallan
 * en el reporte de caja. La selección se guarda por usuario.
 */
const PrintOptionsDialog = ({
    open,
    onClose,
    onSave,
    paymentMethods = {},
    initialOptions,
    formatCurrency
}) => {
    const [isThermal, setIsThermal] = useState(true);
    const [selectedMethods, setSelectedMethods] = useState([]);
    const [includeCustomer, setIncludeCustomer] = useState(false);

    useEffect(() => {
        if (!open) return;
        setIsThermal(initialOptions?.isThermal ?? true);
        setSelectedMethods(Array.isArray(initialOptions?.detailMethods) ? initialOptions.detailMethods : []);
        setIncludeCustomer(Boolean(initialOptions?.includeCustomer));
    }, [open, initialOptions]);

    const methodEntries = Object.entries(paymentMethods || {})
        .sort(([a], [b]) => a.localeCompare(b));

    const isSelected = (method) => selectedMethods.some(
        selected => selected.toLowerCase() === method.toLowerCase()
    );

    const toggleMethod = (method) => {
        setSelectedMethods(prev => (
            prev.some(selected => selected.toLowerCase() === method.toLowerCase())
                ? prev.filter(selected => selected.toLowerCase() !== method.toLowerCase())
                : [...prev, method]
        ));
    };

    const handleSave = () => {
        onSave({ isThermal, detailMethods: selectedMethods, includeCustomer });
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
            fullWidth
            disableEnforceFocus
        >
            <DialogTitle>Opciones de impresión</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Formato
                </Typography>
                <RadioGroup
                    row
                    value={isThermal ? 'thermal' : 'a4'}
                    onChange={(event) => setIsThermal(event.target.value === 'thermal')}
                >
                    <FormControlLabel value="thermal" control={<Radio />} label="80 mm" />
                    <FormControlLabel value="a4" control={<Radio />} label="A4" />
                </RadioGroup>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Detallar movimientos de:
                </Typography>

                {methodEntries.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        Esta sesión no tiene ventas por método de pago.
                    </Typography>
                ) : methodEntries.map(([method, amount]) => (
                    <FormControlLabel
                        key={method}
                        control={(
                            <Checkbox
                                checked={isSelected(method)}
                                onChange={() => toggleMethod(method)}
                            />
                        )}
                        label={(
                            <Box component="span" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <span>{method}</span>
                                <Typography component="span" variant="body2" color="text.secondary">
                                    {formatCurrency ? formatCurrency(amount) : amount}
                                </Typography>
                            </Box>
                        )}
                        sx={{ display: 'flex', ml: 0 }}
                    />
                ))}

                <Divider sx={{ my: 2 }} />

                <FormControlLabel
                    control={(
                        <Checkbox
                            checked={includeCustomer}
                            onChange={(event) => setIncludeCustomer(event.target.checked)}
                        />
                    )}
                    label="Incluir nombre del cliente"
                    sx={{ ml: 0 }}
                />

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    La configuración se guarda por usuario y se aplica a las próximas impresiones.
                </Typography>
            </DialogContent>
            <DialogActions>
                <StyledButton onClick={onClose} variant="outlined" color="secondary">
                    Cancelar
                </StyledButton>
                <StyledButton onClick={handleSave} variant="contained">
                    Guardar
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};

PrintOptionsDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    paymentMethods: PropTypes.object,
    initialOptions: PropTypes.shape({
        isThermal: PropTypes.bool,
        detailMethods: PropTypes.arrayOf(PropTypes.string),
        includeCustomer: PropTypes.bool
    }),
    formatCurrency: PropTypes.func
};

PrintOptionsDialog.defaultProps = {
    paymentMethods: {},
    initialOptions: undefined,
    formatCurrency: undefined
};

export default PrintOptionsDialog;
