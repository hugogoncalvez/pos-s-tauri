const modulePermissions = {
  Ventas: {
    vista: 'ver_vista_ventas',
    acciones: [
      // Listados para la venta
      'listar_productos',
      'listar_clientes',
      'listar_combos',
      'listar_promociones',
      'listar_medios_pago',
      // Acciones de venta
      'accion_crear_venta',
      'accion_cancelar_venta',
      'accion_aplicar_descuento',
      'generar_comprobante_fiscal'
    ]
  },
  Caja: {
    vista: 'ver_vista_caja_admin', // Vista para Admin/Gerente
    acciones: [
      'listar_movimientos_caja',
      'accion_abrir_caja',
      'accion_cerrar_caja_propia',
      'accion_cerrar_caja_ajena',
      'accion_registrar_movimiento_caja'
    ]
  },
  MiCaja: {
    vista: 'ver_mi_caja', // Vista para Cajero
    acciones: [
      'listar_movimientos_caja',
      'accion_abrir_caja',
      'accion_cerrar_caja_propia',
      'accion_registrar_movimiento_caja'
    ]
  },
  Stock: {
    vista: 'ver_vista_stock',
    acciones: [
      // Listados
      'listar_stock',
      'listar_productos',
      'listar_presentaciones',
      // Acciones CRUD
      'accion_crear_producto',
      'accion_editar_producto',
      'accion_eliminar_producto',
      // Otras Acciones
      'accion_ajustar_stock',
      'accion_importar_stock',
      'accion_imprimir_codigos'
    ]
  },
  Clientes: {
    vista: 'ver_vista_clientes',
    acciones: [
      'listar_clientes',
      'accion_crear_cliente',
      'accion_editar_cliente',
      'accion_eliminar_cliente',
      'accion_registrar_pago_cliente'
    ]
  },
  Compras: {
    vista: 'ver_vista_compras',
    acciones: [
      'listar_proveedores',
      'accion_crear_proveedor',
      'accion_crear_compra'
    ]
  },
  DashBoard: {
    vista: 'ver_vista_dashboard',
    acciones: [
      // Vistas principales del Drawer
      'ver_vista_informes',
      'ver_vista_auditoria',
      'ver_vista_usuarios',
      'ver_vista_promociones',
      'ver_vista_combos',
      'ver_vista_impresion_codigos',
      'ver_vista_editor_tema',
      'accion_editar_tema',
      // Widgets y reportes específicos del Dashboard
      'ver_informe_productos_mas_vendidos',
      'ver_informe_stock_bajo',
      'ver_widget_compras_hoy',
      'ver_widget_total_clientes',
      'ver_widget_total_proveedores'
      // Acciones
    ]
  },
  Promociones: {
    vista: 'ver_vista_promociones',
    acciones: [
      'accion_gestionar_promociones'
    ]
  },
  Combos: {
    vista: 'ver_vista_combos',
    acciones: [
      'accion_gestionar_combos'
    ]
  },
  // Módulos que no tienen una vista principal pero agrupan permisos
  Reportes: {
    acciones: ['listar_ventas_historial', 'listar_reportes_stock', 'accion_exportar_reportes']
  },
  Usuarios: {
    acciones: ['accion_crear_usuario', 'accion_editar_usuario', 'accion_eliminar_usuario', 'accion_gestionar_roles']
  },
  Configuracion: {
    vista: 'ver_vista_configuracion', // Vista genérica para configuraciones
    acciones: [
      'ver_vista_recargos_pagos',
      'accion_gestionar_recargos_pagos'
    ]
  },
  AdministracionFiscal: {
    vista: 'ver_configuracion_fiscal',
    acciones: [
      'gestionar_configuracion_fiscal',
      'ver_puntos_de_venta',
      'gestionar_puntos_de_venta'
    ]
  }
};

export default modulePermissions;
