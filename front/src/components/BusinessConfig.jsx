import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Grid, useTheme, CircularProgress, InputAdornment, Divider, Avatar, MenuItem } from '@mui/material';
import { Business, Badge, Phone, Email, Language, LocationOn, Notes, CloudUpload, Storefront, ReceiptLong } from '@mui/icons-material';
import { StyledButton as Button } from '../styledComponents/ui/StyledButton';
import { UseFetchQuery } from '../hooks/useQuery';
import { Api as api } from '../api/api';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import { mostrarCarga } from '../functions/mostrarCarga';
import Swal from 'sweetalert2';

/**
 * Componente para configurar los datos de la empresa.
 * Incluye optimización automática de imágenes para proteger la base de datos.
 */
const BusinessConfig = () => {
    const theme = useTheme();
    const { data: config, isLoading, refetch } = UseFetchQuery('businessConfig', '/business-config', true);
    
    const [formData, setFormData] = useState({
        name: '', cuit: '', iibb: '', taxCondition: '', address: '', phone: '', email: '', website: '', footerText: '', logo: ''
    });

    useEffect(() => {
        if (config) setFormData(config);
    }, [config]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    /**
     * Redimensiona y comprime la imagen antes de guardarla.
     */
    const resizeImage = (file, maxWidth = 400, maxHeight = 400) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // PNG para mejor compatibilidad con transparencias y motores de impresión
                    resolve(canvas.toDataURL('image/png')); 
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    };

    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                mostrarError('Por favor selecciona un archivo de imagen.', theme);
                return;
            }

            mostrarCarga('Optimizando logotipo...', theme);
            try {
                const optimizedBase64 = await resizeImage(file);
                setFormData(prev => ({ ...prev, logo: optimizedBase64 }));
                Swal.close();
                mostrarExito('Imagen optimizada y cargada.', theme);
            } catch (error) {
                Swal.close();
                mostrarError('Error al procesar la imagen.', theme);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        mostrarCarga('Guardando configuración...', theme);
        try {
            await api.put('/business-config', formData);
            Swal.close();
            mostrarExito('¡Configuración guardada!', theme);
            refetch();
        } catch (error) {
            Swal.close();
            const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error al guardar la configuración.';
            mostrarError(errorMsg, theme);
        }
    };

    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
    );

    return (
        <Box sx={{ p: 'clamp(1rem, 3vw, 3rem)', maxWidth: '1200px', margin: '0 auto' }}>
            <Paper sx={{ 
                p: 'clamp(1.5rem, 3vw, 2.5rem)', 
                mb: 4, 
                background: theme.palette.background.componentHeaderBackground, 
                color: theme.palette.primary.contrastText,
                borderRadius: '24px',
                boxShadow: theme.shadows[10],
                position: 'relative',
                overflow: 'hidden'
            }}>
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h4" sx={{ fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 800, mb: 1, letterSpacing: '-0.5px' }}>
                        Identidad del Negocio
                    </Typography>
                    <Typography variant="subtitle1" sx={{ opacity: 0.9, fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}>
                        Gestiona la marca y los datos fiscales que aparecerán en tus recibos.
                    </Typography>
                </Box>
                <Storefront sx={{ position: 'absolute', right: -20, top: -20, fontSize: '15rem', opacity: 0.1, transform: 'rotate(-15deg)' }} />
            </Paper>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 4, borderRadius: '24px', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>Logo de la Empresa</Typography>
                            
                            <Box sx={{ position: 'relative', '&:hover .upload-overlay': { opacity: 1 } }}>
                                <Avatar 
                                    src={formData.logo} 
                                    sx={{ 
                                        width: 'clamp(150px, 15vw, 200px)', 
                                        height: 'clamp(150px, 15vw, 200px)', 
                                        boxShadow: theme.shadows[8],
                                        border: `4px solid ${theme.palette.background.paper}`,
                                        bgcolor: theme.palette.action.hover
                                    }}
                                >
                                    <Business sx={{ fontSize: 80, color: theme.palette.text.disabled }} />
                                </Avatar>
                                <label htmlFor="logo-upload">
                                    <Box className="upload-overlay" sx={{ 
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                        bgcolor: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', 
                                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        opacity: 0, transition: '0.3s'
                                    }}>
                                        <CloudUpload sx={{ color: 'white', fontSize: 40 }} />
                                    </Box>
                                </label>
                            </Box>
                            
                            <input accept="image/*" style={{ display: 'none' }} id="logo-upload" type="file" onChange={handleLogoChange} />
                            
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
                                El sistema optimizará automáticamente tu imagen para asegurar la mejor velocidad.
                            </Typography>

                            <TextField
                                fullWidth
                                label="Nombre del Negocio"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                variant="filled"
                                sx={{ mt: 'auto' }}
                                placeholder="Ej: Mi Negocio"
                                InputProps={{ 
                                    disableUnderline: true, 
                                    sx: { borderRadius: '12px' },
                                    startAdornment: (<InputAdornment position="start"><Business color="primary" /></InputAdornment>) 
                                }}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                                    <Badge /> Datos Fiscales (Argentina)
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="CUIT" name="cuit" value={formData.cuit} onChange={handleChange} placeholder="20-12345678-9" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Ingresos Brutos (IIBB)" name="iibb" value={formData.iibb} onChange={handleChange} placeholder="Ej: 901-123456-7" />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            select
                                            label="Condición Fiscal"
                                            name="taxCondition"
                                            value={formData.taxCondition || ''}
                                            onChange={handleChange}
                                            helperText="Condición frente a AFIP que aparecerá en los recibos."
                                        >
                                            <MenuItem value="">Sin especificar</MenuItem>
                                            <MenuItem value="Monotributo">Monotributo</MenuItem>
                                            <MenuItem value="Responsable Inscripto">Responsable Inscripto</MenuItem>
                                            <MenuItem value="Exento">Exento</MenuItem>
                                            <MenuItem value="No Responsable">No Responsable</MenuItem>
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                                    <LocationOn /> Ubicación y Contacto
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Dirección Completa" name="address" value={formData.address} onChange={handleChange} multiline rows={2} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Teléfono" name="phone" value={formData.phone} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><Phone sx={{ fontSize: 20 }} /></InputAdornment>) }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="E-mail" name="email" value={formData.email} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><Email sx={{ fontSize: 20 }} /></InputAdornment>) }} />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider />

                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.primary.main }}>
                                    <ReceiptLong /> Información de Recibos
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Sitio Web (Opcional)" name="website" value={formData.website} onChange={handleChange} InputProps={{ startAdornment: (<InputAdornment position="start"><Language sx={{ fontSize: 20 }} /></InputAdornment>) }} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Texto de Pie de Página (Opcional)" name="footerText" value={formData.footerText} onChange={handleChange} multiline rows={2} placeholder="Ej: ¡Gracias por su compra! Vuelva pronto." helperText="Este texto aparecerá al final de tus tickets impresos." />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button type="submit" variant="contained" size="large" sx={{ width: 'clamp(280px, 40vw, 500px)', py: 2, borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, boxShadow: theme.shadows[6] }}>
                            Guardar Cambios
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default BusinessConfig;
