export function pluralizar(unidad) {
    // Objeto con las unidades y sus plurales
    const plurales = {
        "kilogramo": "kilogramos",
        "unidad": "unidades",
        "metro": "metros",
        "litro": "litros",
        "gramo": "gramos",
        // Agrega más unidades según sea necesario
    };

    // Obtener el plural o la unidad original
    const resultado = plurales[unidad.toLowerCase()] || unidad;

    // Retornar el resultado con la primera letra en mayúscula
    return resultado.charAt(0).toUpperCase() + resultado.slice(1);
}