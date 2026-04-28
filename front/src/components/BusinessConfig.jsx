import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, TextField, Grid, useTheme, CircularProgress, InputAdornment } from '@mui/material';
import { Business, Badge, Phone, Email, Language, LocationOn, Notes, CloudUpload } from '@mui/icons-material';
import { StyledButton as Button } from '../styledComponents/ui/StyledButton';
import { UseFetchQuery } from '../hooks/useQuery';
import { Api as api } from '../api/api';
import { mostrarExito } from '../functions/mostrarExito';
import { mostrarError } from '../functions/MostrarError';
import { mostrarCarga } from '../functions/mostrarCarga';
import Swal from 'sweetalert2';

/**
 * Componente para configurar os dados da empresa.
 * Adaptado para o mercado brasileiro (CNPJ, IE).
 */
const BusinessConfig = () => {
    const theme = useTheme();
    const { data: config, isLoading, refetch } = UseFetchQuery('businessConfig', '/business-config', true);
    
    const [formData, setFormData] = useState({
        name: '',
        cnpj: '',
        ie: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        footerText: '',
        logo: ''
    });

    useEffect(() => {
        if (config) {
            setFormData(config);
        }
    }, [config]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, logo: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        mostrarCarga('Salvando configurações...', theme);
        try {
            await api.put('/business-config', formData);
            Swal.close();
            mostrarExito('Configurações atualizadas com sucesso!', theme);
            refetch();
        } catch (error) {
            Swal.close();
            mostrarError('Erro ao atualizar configurações.', theme);
        }
    };

    if (isLoading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
        </Box>
    );

    return (
        <Box sx={{ p: 'clamp(1rem, 2vw, 2rem)', maxWidth: '1200px', margin: '0 auto' }}>
            <Paper sx={{ 
                p: 3, 
                mb: 4, 
                background: theme.palette.background.componentHeaderBackground, 
                color: theme.palette.primary.contrastText,
                borderRadius: '16px'
            }}>
                <Typography variant="h4" sx={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', fontWeight: 'bold' }}>
                    Configurações do Negócio
                </Typography>
                <Typography variant="subtitle1">
                    Personalize os dados que aparecerão nos seus relatórios e recibos.
                </Typography>
            </Paper>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3} justifyContent="center">
                    {/* Seção Logo */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, textAlign: 'center', height: '100%', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" gutterBottom>Logotipo</Typography>
                            <Box sx={{ 
                                width: '150px', 
                                height: '150px', 
                                border: `2px dashed ${theme.palette.divider}`, 
                                borderRadius: '8px',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                {formData.logo ? (
                                    <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                ) : (
                                    <Business sx={{ fontSize: 60, color: 'text.disabled' }} />
                                )}
                            </Box>
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="logo-upload"
                                type="file"
                                onChange={handleLogoChange}
                            />
                            <label htmlFor="logo-upload">
                                <Button variant="contained" component="span" startIcon={<CloudUpload />}>
                                    Upload Logo
                                </Button>
                            </label>
                        </Paper>
                    </Grid>

                    {/* Seção Dados */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, borderRadius: '16px' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Nome Fantasia / Razão Social"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><Business /></InputAdornment>) }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="CNPJ"
                                        name="cnpj"
                                        value={formData.cnpj}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><Badge /></InputAdornment>) }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Inscrição Estadual (IE)"
                                        name="ie"
                                        value={formData.ie}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><Badge /></InputAdornment>) }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Endereço Completo"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><LocationOn /></InputAdornment>) }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Telefone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><Phone /></InputAdornment>) }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="E-mail"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><Email /></InputAdornment>) }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Website"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><Language /></InputAdornment>) }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Texto de Rodapé (Recibos)"
                                        name="footerText"
                                        value={formData.footerText}
                                        onChange={handleChange}
                                        multiline
                                        rows={2}
                                        InputProps={{ startAdornment: (<InputAdornment position="start"><Notes /></InputAdornment>) }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button type="submit" variant="contained" size="large" sx={{ width: 'clamp(200px, 50%, 400px)', py: 1.5 }}>
                            Salvar Configurações
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default BusinessConfig;
