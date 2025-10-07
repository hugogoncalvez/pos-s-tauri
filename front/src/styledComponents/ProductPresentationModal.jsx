import React, { useState, useEffect, useRef } from 'react';
import {
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Box,
    DialogActions,
    Grid
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ClearIcon from '@mui/icons-material/Clear';
import { StyledDialog } from './ui/StyledDialog';
import { StyledButton } from './ui/StyledButton';
import Grid2 from '@mui/material/Unstable_Grid2';

export const ProductPresentationModal = ({ open, onClose, product, onSelectPresentation }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef(null);

    // Reset index when modal opens or product changes
    useEffect(() => {
        if (open) {
            setSelectedIndex(0);
        }
    }, [open]);

    // Keyboard navigation handler
    useEffect(() => {
        if (!open || !product?.presentations) return;

        const handleKeyDown = (e) => {
            const presentationsCount = product.presentations.length;
            if (presentationsCount === 0) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prevIndex) => (prevIndex + 1) % presentationsCount);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prevIndex) => (prevIndex - 1 + presentationsCount) % presentationsCount);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < presentationsCount) {
                    onSelectPresentation(product.presentations[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, selectedIndex, product, onSelectPresentation, onClose]);

    // Scroll into view logic
    useEffect(() => {
        if (open && listRef.current) {
            const selectedItem = listRef.current.children[selectedIndex];
            if (selectedItem) {
                selectedItem.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [selectedIndex, open]);

    if (!product) return null;

    return (
        <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle
                sx={{
                    backgroundColor: 'background.dialog',
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Grid2 container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', FlexDirection: 'column' }}>
                    <Grid2 sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocalOfferIcon sx={{ mr: 1, mb: 0, color: 'primary.main' }} />
                        <Typography variant='h6' component="span" fontWeight="bold" sx={{ ml: 1 }}>Seleccionar Presentación para:</Typography>
                    </Grid2>
                    <Typography component="span" fontWeight="bold" sx={{ ml: 1 }}>{product.name}</Typography>


                </Grid2>
            </DialogTitle>
            <DialogContent sx={{ p: 3, backgroundColor: 'background.dialog', color: 'text.primary' }}>
                <List ref={listRef}>
                    {product.presentations.map((presentation, index) => (
                        <ListItem key={presentation.id || index} disablePadding>
                            <ListItemButton
                                onClick={() => onSelectPresentation(presentation)}
                                selected={selectedIndex === index}
                            >
                                <ListItemText primary={presentation.name} secondary={presentation.price ? `Precio: ${parseFloat(presentation.price).toFixed(2)}` : null} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions sx={{ p: 2, backgroundColor: 'background.dialog' }}>
                <StyledButton
                    sx={{ padding: '2px 12px' }}
                    variant="outlined"
                    color='error'
                    onClick={onClose}
                    startIcon={<ClearIcon />}
                >
                    Cancelar
                </StyledButton>
            </DialogActions>
        </StyledDialog>
    );
};