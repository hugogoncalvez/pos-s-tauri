import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Api } from '../api/api';
import { syncService } from '../services/syncService';
import { useOnlineStatus } from './useOnlineStatus';

/**
 * @description Hook para gestionar la creación de una venta.
 * Se encarga de decidir si enviar la venta directamente al servidor (online)
 * o guardarla localmente para sincronización posterior (offline).
 *
 * @returns Una mutación de React Query.
 *          - `mutate(saleData)`: Función para iniciar la creación de la venta.
 *          - `isLoading`: true si la operación está en curso.
 *          - `isSuccess`: true si la operación fue exitosa.
 *          - `isError`: true si hubo un error.
 *          - `error`: El objeto de error.
 *          - `data`: Los datos de la respuesta (de la API o del guardado local).
 */
export const useCreateSale = () => {
  const { isOnline } = useOnlineStatus();
  const queryClient = useQueryClient();

  const mutationFn = async (saleData) => {
    if (isOnline) {
      // MODO ONLINE: Llamada directa a la API
      //console.log('[useCreateSale] Modo Online: Enviando venta directamente al servidor...');
      const response = await Api.post('/sales', saleData);
      return { ...response.data, synced: true, source: 'api' };
    } else {
      // MODO OFFLINE: Usar syncService para guardar localmente
      //console.log('[useCreateSale] Modo Offline: Guardando venta localmente...');
      // La función saveSale de syncService ya está diseñada para manejar el guardado local.
      const response = await syncService.saveSale(saleData, false);
      return { ...response, source: 'local' };
    }
  };

  return useMutation({
    mutationFn,
    networkMode: 'always', // Asegura que la mutación se ejecute incluso offline
    onSuccess: (data, variables) => {
      //console.log('[useCreateSale] Venta procesada con éxito.', data);

      // Lógica de post-venta
      // Invalidar queries para refrescar el stock, que siempre cambia.
      queryClient.invalidateQueries({ queryKey: ['stock'] });

      // Si la venta fue online y directa, actualizamos el caché de la sesión manualmente
      // para una respuesta de UI instantánea.
      if (data.source === 'api') {
        const { user_id, total_neto } = variables; // Usar total_neto que es el final
        queryClient.setQueryData(['activeCashSession', user_id], (oldData) => {
          if (!oldData || !oldData.session) return oldData;

          const newTotalSales = (parseFloat(oldData.session.total_sales) || 0) + parseFloat(total_neto);

          return {
            ...oldData,
            session: {
              ...oldData.session,
              total_sales: newTotalSales.toFixed(2),
            },
          };
        });
        //console.log('[useCreateSale] Caché de sesión activa actualizado manualmente.');
      }
      // Si fue local, el syncManager se encargará de la UI cuando corresponda.
    },
    onError: (error) => {
      console.error('[useCreateSale] Error al procesar la venta:', error);
    },
  });
};
