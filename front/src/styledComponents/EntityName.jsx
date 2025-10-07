import { Typography, Chip, CircularProgress } from '@mui/material';
import { UseFetchQuery } from '../hooks/useQuery';

const EntityName = ({ entityType, entityId }) => {
    // Casos especiales que no requieren una consulta a la API
    if (!entityId && entityId !== 0) {
        return <Typography component="span" variant="body2" fontWeight="bold">N/A</Typography>;
    }
    if (entityType === 'customer' && entityId === 1) {
        return <Typography component="span" variant="body2" fontWeight="bold">Consumidor Final</Typography>;
    }

    // Determinar el endpoint y la clave del dato a mostrar
    let endpoint = '';
    let dataKey = 'name'; // Clave por defecto para el nombre

    switch (entityType) {
        case 'customer':
            endpoint = `/customers/${entityId}`;
            dataKey = 'name';
            break;
        case 'user':
            endpoint = `/users/${entityId}`;
            dataKey = 'username';
            break;
        case 'paymentMethod':
            endpoint = `/payment/${entityId}`;
            dataKey = 'method';
            break;
        case 'cashSession':
            // Para sesiones, simplemente mostramos el ID de forma más amigable
            return <Typography component="span" variant="body2" fontWeight="bold">#{entityId}</Typography>;
        default:
            // Si el tipo de entidad es desconocido, solo devolvemos el ID
            return <Typography component="span" variant="body2" fontWeight="bold">{entityId}</Typography>;
    }

    const { data, isLoading, isError } = UseFetchQuery(
        [`entity_${entityType}`, entityId], // Clave única para la caché de React Query
        endpoint,
        !!entityId // Solo ejecutar si hay un entityId
    );

    if (isLoading) {
        return <CircularProgress size={14} sx={{ verticalAlign: 'middle' }} />;
    }

    if (isError) {
        return <Chip label={`Error ID: ${entityId}`} size="small" color="error" />;
    }

    // Extraer el nombre del objeto de datos (puede estar anidado)
    const name = data ? (data.data ? data.data[dataKey] : data[dataKey]) : `ID: ${entityId}`;

    return <Typography component="span" variant="body2" fontWeight="bold">{name || `ID no encontrado: ${entityId}`}</Typography>;
};

export default EntityName;
