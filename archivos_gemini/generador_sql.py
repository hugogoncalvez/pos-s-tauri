
import csv

# --- Configuración ---
CSV_PATH = '/home/hugo/01-Proyectos/001-POS-System/inv_abarrotes.csv'
OUTPUT_SQL_PATH = '/home/hugo/01-Proyectos/001-POS-System/poblar_stock_definitivo.sql'

categories_config = [
    {'id': 2, 'name': 'Lácteos', 'keywords': ['leche', 'yogurt', 'manteca', 'crema', 'queso', 'danonino', 'casancrem', 'milkaut', 'serenisima', 'sancor', 'ilolay']},
    {'id': 3, 'name': 'Panadería', 'keywords': ['pan', 'panaderia', 'factura', 'medialuna', 'budin', 'pascualina', 'tapas', 'prepizza']},
    {'id': 4, 'name': 'Bebidas', 'keywords': ['agua', 'gaseosa', 'jugo', 'vino', 'cerveza', 'soda', 'licor', 'fernet', 'aperitivo', 'coca', 'pepsi', 'sprite', 'fanta', '7up', 'terma', 'baggio']},
    {'id': 5, 'name': 'Snacks', 'keywords': ['papas', 'galletitas', 'snack', 'alfajor', 'turron', 'caramelos', 'chupetin', 'chicle', 'saladix', 'pepitos', 'oreo', 'terrabusi', 'arcor', 'bagley']},
    {'id': 6, 'name': 'Carnes y Embutidos', 'keywords': ['carne', 'pollo', 'cerdo', 'salchicha', 'hamburguesa', 'jamon', 'salame', 'paleta', 'paty', 'swift']},
    {'id': 7, 'name': 'Frutas y Verduras', 'keywords': ['fruta', 'verdura', 'manzana', 'banana', 'naranja', 'tomate', 'lechuga', 'papa', 'cebolla', 'ajo']},
    {'id': 8, 'name': 'Limpieza', 'keywords': ['lavandina', 'detergente', 'jabon', 'limpia', 'esponja', 'virulana', 'cif', 'ayudin', 'skip', 'ala', 'drive', 'poett', 'lysoform']},
    {'id': 9, 'name': 'Perfumería', 'keywords': ['perfume', 'desodorante', 'shampoo', 'acondicionador', 'crema', 'talco', 'rexona', 'axe', 'dove', 'nivea', 'sedal', 'pantene']},
    {'id': 10, 'name': 'Congelados', 'keywords': ['congelado', 'helado', 'frizze']},
    {'id': 21, 'name': 'Fiambres y Quesos', 'keywords': ['queso', 'fiambre', 'salame', 'jamon', 'mortadela']},
    {'id': 22, 'name': 'Art. de Libreria', 'keywords': ['lapiz', 'birome', 'cuaderno', 'hoja', 'goma', 'regla', 'tijera', 'plasticola', 'adhesivo', 'papel', 'folio', 'cartuchera']},
    {'id': 23, 'name': 'Art. de Bazar', 'keywords': ['vaso', 'plato', 'taza', 'cuchillo', 'tenedor', 'olla', 'sarten', 'jarra', 'fuente', 'escurridor']},
    {'id': 24, 'name': 'Alimentos Secos', 'keywords': ['arroz', 'fideos', 'harina', 'azucar', 'polenta', 'lentejas', 'garbanzos', 'porotos', 'aceite', 'sal', 'avena']},
    {'id': 25, 'name': 'Enlatados y Conservas', 'keywords': ['atun', 'sardina', 'caballa', 'choclo', 'arvejas', 'durazno', 'lata', 'conserva']},
    {'id': 26, 'name': 'Mascotas', 'keywords': ['mascota', 'perro', 'gato', 'alimento', 'pedigree', 'whiskas']},
    {'id': 27, 'name': 'Condimentos y Sazonadores', 'keywords': ['condimento', 'sazonador', 'especias', 'aderezo', 'vinagre', 'mostaza', 'ketchup', 'mayonesa', 'salsa']},
    {'id': 1, 'name': 'General', 'keywords': []} # Default al final
]

pesable_keywords = ['kg', 'kilo', 'queso', 'fiambre', 'carne', 'jamon', 'paleta', 'granel']

def get_category_id(product_name):
    product_name_lower = product_name.lower()
    for category in categories_config:
        for keyword in category['keywords']:
            if keyword.lower() in product_name_lower:
                return category['id']
    return 1

def get_sale_type(product_name):
    product_name_lower = product_name.lower()
    for keyword in pesable_keywords:
        if keyword.lower() in product_name_lower:
            return ('pesable', 2)
    return ('unitario', 1)

sql_statements = []
try:
    with open(CSV_PATH, mode='r', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        next(reader)

        for row in reader:
            try:
                codigo, descripcion, _, precio_venta, _, _, _, departamento = row
                
                name_escaped = descripcion.replace("'", "''").strip()
                if not name_escaped:
                    continue

                barcode = f"'{codigo}'" if codigo else 'NULL'
                description_escaped = f"Descripción de {name_escaped}".replace("'", "''")
                price = float(precio_venta.replace('$', '').replace('.', '').replace(',', '.'))

                category_id = get_category_id(name_escaped)
                tipo_venta, units_id = get_sale_type(name_escaped)
                supplier_name_escaped = departamento.replace("'", "''").strip()
                
                values = [
                    barcode,
                    f"'{name_escaped}'",
                    f"'{description_escaped}'",
                    f"{price:.2f}",
                    f"'{tipo_venta}'",
                    '0.00',
                    '10000',
                    '0',
                    str(units_id),
                    str(category_id),
                    f"(SELECT id FROM suppliers WHERE nombre = '{supplier_name_escaped}')",
                    '1',
                    'NOW()',
                    'NOW()'
                ]
                
                sql = f"INSERT IGNORE INTO `stocks` (`barcode`, `name`, `description`, `price`, `tipo_venta`, `cost`, `stock`, `min_stock`, `units_id`, `category_id`, `supplier_id`, `visible`, `createdAt`, `updatedAt`) VALUES ({ ', '.join(values) });"
                sql_statements.append(sql)
            except (ValueError, IndexError):
                continue

    with open(OUTPUT_SQL_PATH, 'w', encoding='utf-8') as f:
        f.write('-- Script completo y correcto para poblar la tabla de stock.\n')
        f.write('START TRANSACTION;\n')
        f.write('\n'.join(sql_statements))
        f.write('\nCOMMIT;\n')
    
    print(f"Archivo {OUTPUT_SQL_PATH} generado con éxito con {len(sql_statements)} productos.")

except FileNotFoundError:
    print(f"Error: No se encontró el archivo {CSV_PATH}")
except Exception as e:
    print(f"Ocurrió un error: {e}")
